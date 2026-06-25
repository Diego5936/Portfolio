"""
Pre-generate diffusion fallback bundles for every weekday × time-period combo.

Output layout (default: client/public/generated/diffusion-fallback/):
  manifest.json
  monday-morning/
    metadata.json
    step-000.png
    step-004.png
    ...
    final.png
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import torch
from diffusers.utils import numpy_to_pil

_SERVICES_DIR = Path(__file__).resolve().parents[1] / "src" / "services"
if str(_SERVICES_DIR) not in sys.path:
    sys.path.insert(0, str(_SERVICES_DIR))

from diffusion_generator import (  # noqa: E402
    DECODE_EVERY,
    NUM_STEPS,
    PIXEL_SIZE,
    SIZE,
    _load_pipeline,
    _pixelate_image,
)

# Matches server/src/services/diffusionGeneration.ts
DAY_MAPPINGS: dict[str, str] = {
    "Monday": "Focused Monday cafe: peace, coffee, books",
    "Tuesday": "Inventive Tuesday workshop: science, tools, robots",
    "Wednesday": "Curious Wednesday mountains: nature, trails, animals",
    "Thursday": "Creative Thursday canvas: floating shapes, paint, flowers",
    "Friday": "Electric Friday city: energy, neon lights, music",
    "Saturday": "Escape Saturday world: vibrant, magic, dreamy",
    "Sunday": "Relaxing Sunday beach: waves, soft clouds, palm trees",
}

WEEKDAYS: tuple[str, ...] = (
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
)

# Canonical calendar labels for each weekday (cosmetic prompt text only).
WEEKDAY_REFERENCE_DATES: dict[str, str] = {
    "Monday": "June 16",
    "Tuesday": "June 17",
    "Wednesday": "June 18",
    "Thursday": "June 19",
    "Friday": "June 20",
    "Saturday": "June 21",
    "Sunday": "June 22",
}

TIME_PERIODS: dict[str, str] = {
    "morning": "09",
    "afternoon": "14",
    "sunset": "19",
    "night": "22",
}

DEFAULT_OUTPUT_DIR = (
    Path(__file__).resolve().parents[2]
    / "client"
    / "public"
    / "generated"
    / "diffusion-fallback"
)


@dataclass(frozen=True)
class PromptCombo:
    weekday: str
    time_period: str
    hour: str
    cur_date: str
    prompt: str
    prompt_key: str
    prompt_key_with_date: str
    slug: str


def build_prompt(weekday: str, cur_date: str, hour: str) -> str:
    weekday_prompt = DAY_MAPPINGS[weekday]
    hour_value = int(hour)

    prompt = (
        f"Create a cute scene, middle of {cur_date} vibes. "
        f"Specifically focused on {weekday_prompt}. "
    )

    if hour_value < 12:
        prompt += "In the morning"
    elif hour_value < 18:
        prompt += "In the afternoon"
    elif hour_value == 19:
        prompt += "At sunset"
    else:
        prompt += "At night"

    return prompt


def slug_for(weekday: str, time_period: str) -> str:
    return f"{weekday.lower()}-{time_period}"


def list_combos(periods: list[str]) -> list[PromptCombo]:
    combos: list[PromptCombo] = []

    for weekday in WEEKDAYS:
        cur_date = WEEKDAY_REFERENCE_DATES[weekday]
        for time_period in periods:
            hour = TIME_PERIODS[time_period]
            prompt = build_prompt(weekday, cur_date, hour)
            combos.append(
                PromptCombo(
                    weekday=weekday,
                    time_period=time_period,
                    hour=hour,
                    cur_date=cur_date,
                    prompt=prompt,
                    prompt_key=f"{weekday}|{time_period}",
                    prompt_key_with_date=f"{weekday}|{time_period}|{cur_date}",
                    slug=slug_for(weekday, time_period),
                )
            )

    return combos


def seed_for_slug(slug: str, seed_base: int | None) -> int:
    digest = int(hashlib.md5(slug.encode("utf-8")).hexdigest()[:8], 16)
    if seed_base is None:
        return digest % (2**31)
    return (seed_base + digest) % (2**31)


def public_url(root_name: str, slug: str, filename: str) -> str:
    return f"/generated/{root_name}/{slug}/{filename}"


def generate_bundle(
    pipe,
    combo: PromptCombo,
    combo_dir: Path,
    public_root_name: str,
    seed: int,
) -> dict:
    combo_dir.mkdir(parents=True, exist_ok=True)

    generator = torch.Generator(device="cpu").manual_seed(seed)
    total_steps = NUM_STEPS
    frames: list[dict] = []
    started = time.perf_counter()

    def callback_on_step_end(_pipe, step_idx, _timestamp, callback_kwargs):
        latents = callback_kwargs["latents"]

        is_first = step_idx == 0
        is_last = step_idx == total_steps - 1
        should_decode = is_first or is_last or (step_idx % DECODE_EVERY == 0)
        if not should_decode:
            return {}

        with torch.no_grad():
            rgb = _pipe.decode_latents(latents)
        pil_image = numpy_to_pil(rgb)[0]

        display = _pixelate_image(pil_image, pixel_size=PIXEL_SIZE)
        filename = f"step-{step_idx:03d}.png"
        frame_path = combo_dir / filename
        display.save(frame_path)

        elapsed_ms = int((time.perf_counter() - started) * 1000)
        progress = int(((step_idx + 1) / total_steps) * 100)
        frames.append(
            {
                "step": step_idx,
                "progress": min(progress, 99),
                "filename": filename,
                "imageUrl": public_url(public_root_name, combo.slug, filename),
                "emittedAtMs": elapsed_ms,
            }
        )
        return {}

    image = pipe(
        prompt=combo.prompt,
        width=SIZE,
        height=SIZE,
        generator=generator,
        guidance_scale=7,
        num_inference_steps=NUM_STEPS,
        callback_on_step_end=callback_on_step_end,
        callback_on_step_end_tensor_inputs=["latents"],
    ).images[0]

    final_display = _pixelate_image(image, pixel_size=PIXEL_SIZE)
    final_filename = "final.png"
    final_path = combo_dir / final_filename
    final_display.save(final_path)

    total_duration_ms = int((time.perf_counter() - started) * 1000)
    final_url = public_url(public_root_name, combo.slug, final_filename)

    last_frame = frames[-1] if frames else None
    if not last_frame or last_frame["filename"] != final_filename:
        frames.append(
            {
                "step": total_steps - 1,
                "progress": 100,
                "filename": final_filename,
                "imageUrl": final_url,
                "emittedAtMs": total_duration_ms,
            }
        )
    else:
        frames[-1] = {
            **last_frame,
            "progress": 100,
            "filename": final_filename,
            "imageUrl": final_url,
            "emittedAtMs": total_duration_ms,
        }

    gap_ms: list[dict] = []
    previous_ms = 0
    previous_step: int | None = None
    for frame in frames:
        gap_ms.append(
            {
                "fromStep": previous_step,
                "toStep": frame["step"],
                "durationMs": frame["emittedAtMs"] - previous_ms,
                "emittedAtMs": frame["emittedAtMs"],
            }
        )
        previous_ms = frame["emittedAtMs"]
        previous_step = frame["step"]

    return {
        "id": combo.slug,
        "weekday": combo.weekday,
        "timePeriod": combo.time_period,
        "promptKey": combo.prompt_key,
        "promptKeyWithDate": combo.prompt_key_with_date,
        "prompt": combo.prompt,
        "seed": seed,
        "numInferenceSteps": NUM_STEPS,
        "decodeEvery": DECODE_EVERY,
        "imageSize": SIZE,
        "pixelSize": PIXEL_SIZE,
        "totalDurationMs": total_duration_ms,
        "finalImageUrl": final_url,
        "frames": frames,
        "frameGaps": gap_ms,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


def parse_periods(raw: str | None) -> list[str]:
    if not raw:
        return list(TIME_PERIODS.keys())

    periods = [part.strip() for part in raw.split(",") if part.strip()]
    unknown = [period for period in periods if period not in TIME_PERIODS]
    if unknown:
        valid = ", ".join(TIME_PERIODS.keys())
        raise SystemExit(f"Unknown period(s): {', '.join(unknown)}. Valid: {valid}")

    return periods


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate diffusion fallback image bundles for the portfolio site.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Directory for fallback assets (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--periods",
        default=None,
        help="Comma-separated periods: morning,afternoon,sunset,night",
    )
    parser.add_argument(
        "--only",
        default=None,
        help="Comma-separated slugs to generate, e.g. monday-morning,tuesday-night",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Skip combos that already contain final.png + metadata.json",
    )
    parser.add_argument(
        "--seed-base",
        type=int,
        default=None,
        help="Optional base seed; each slug gets a deterministic derived seed",
    )
    args = parser.parse_args()

    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    public_root_name = output_dir.name

    periods = parse_periods(args.periods)
    combos = list_combos(periods)

    if args.only:
        wanted = {part.strip() for part in args.only.split(",") if part.strip()}
        combos = [combo for combo in combos if combo.slug in wanted]
        missing = wanted - {combo.slug for combo in combos}
        if missing:
            raise SystemExit(f"Unknown slug(s): {', '.join(sorted(missing))}")

    total = len(combos)
    print(f"Preparing {total} diffusion fallback bundle(s).")
    print(
        "Note: the live server uses 4 time periods "
        "(morning, afternoon, sunset, night) → 28 combos for 7 weekdays."
    )
    print(f"Output: {output_dir}")

    print("Loading diffusion pipeline (one-time warmup)...")
    pipe = _load_pipeline().to("cpu")
    print("Pipeline ready.")

    manifest_entries: list[dict] = []

    for index, combo in enumerate(combos, start=1):
        combo_dir = output_dir / combo.slug
        metadata_path = combo_dir / "metadata.json"
        final_path = combo_dir / "final.png"

        if args.resume and metadata_path.exists() and final_path.exists():
            print(f"[{index}/{total}] Skipping {combo.slug} (already generated)")
            with metadata_path.open(encoding="utf-8") as handle:
                manifest_entries.append(json.load(handle))
            continue

        seed = seed_for_slug(combo.slug, args.seed_base)
        print(f"[{index}/{total}] Generating {combo.slug} (seed={seed})")
        print(f"  prompt: {combo.prompt}")

        metadata = generate_bundle(
            pipe,
            combo,
            combo_dir,
            public_root_name,
            seed,
        )

        with metadata_path.open("w", encoding="utf-8") as handle:
            json.dump(metadata, handle, indent=2)
            handle.write("\n")

        manifest_entries.append(metadata)
        print(
            f"  done in {metadata['totalDurationMs']} ms "
            f"({len(metadata['frames'])} frames)"
        )

    manifest = {
        "version": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "comboCount": len(manifest_entries),
        "periods": periods,
        "combos": manifest_entries,
    }

    manifest_path = output_dir / "manifest.json"
    with manifest_path.open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
        handle.write("\n")

    print(f"Wrote manifest: {manifest_path}")
    print("Fallback generation complete.")


if __name__ == "__main__":
    main()
