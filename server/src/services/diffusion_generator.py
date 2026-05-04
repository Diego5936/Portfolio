import argparse
import datetime as dt
import json
import os
from pathlib import Path

import torch
from PIL import Image
from diffusers import StableDiffusionPipeline
from diffusers.utils import numpy_to_pil

# Model
SIZE = 256
MODEL_ID = "OFA-Sys/small-stable-diffusion-v0"
MODEL_CACHE_DIR = Path(__file__).resolve().parents[2] / ".cache" / "diffusion-model"

# Difussion
GUIDANCE_SCALE = 7
NUM_STEPS = 25
DECODE_EVERY = 5

# Utils
PIXEL_SIZE = 55

# Prompts
DAY_MAPPINGS = {
    "Monday": "Focused Monday cafe: peace, coffee, books",
    "Tuesday": "Inventive Tuesday workshop: science, tools, robots",
    "Wednesday": "Curious Wednesday mountains: nature, trails, animals",
    "Thursday": "Creative Thursday canvas: floating shapes, paint, flowers",
    "Friday": "Electric Friday city: energy, neon lights, music",
    "Saturday": "Escape Saturday world: vibrant, magic, dreamy",
    "Sunday": "Relaxing Sunday beach: waves, soft clouds, palm trees",
}



def emit(payload):
    print(json.dumps(payload), flush=True)

def _pixelate_image(image, pixel_size=55) -> Image.Image:
    small_image = image.resize(
        (pixel_size, pixel_size),
        resample=Image.Resampling.NEAREST,
    )

    return small_image.resize(
        (SIZE, SIZE),
        resample=Image.Resampling.NEAREST,
    )

def _build_prompt():
    now = dt.datetime.now()
    week_day = now.strftime("%A")
    cur_date = now.strftime("%B %d")
    hour = int(now.strftime("%H"))
    weekday_prompt = DAY_MAPPINGS[week_day]

    prompt = (
        f"Create an amazing and vibrant scene middle of {cur_date} vibes. "
        f"Specifically focused on {weekday_prompt}. "
    )

    if hour < 12:
        prompt += "In the morning"
    elif hour < 18:
        prompt += "In the afternoon"
    elif hour == 19:
        prompt += "At sunset"
    else:
        prompt += "At night"

    return prompt


def _load_pipeline():
    if (MODEL_CACHE_DIR / "model_index.json").exists():
        return StableDiffusionPipeline.from_pretrained(
            str(MODEL_CACHE_DIR),
            torch_dtype=torch.float32,
            safety_checker=None,
            requires_safety_checker=False,
            local_files_only=True,
        )

    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float32,
        safety_checker=None,
        requires_safety_checker=False,
    )
    MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    pipe.save_pretrained(str(MODEL_CACHE_DIR))
    return pipe

def generate_with_pipe(pipe, prompt, output_dir, public_root, job_id, seed=None):
    if seed is None:
        generator = torch.Generator(device="cpu")
    else:
        generator = torch.Generator(device="cpu").manual_seed(seed)

    output_dir.mkdir(parents=True, exist_ok=True)
    total_steps = NUM_STEPS

    def callback_on_step_end(pipe, step_idx, timestamp, callback_kwargs):
        latents = callback_kwargs["latents"]

        is_first = step_idx == 0
        is_last = step_idx == total_steps - 1
        should_decode = is_first or is_last or (step_idx % DECODE_EVERY == 0)
        if not should_decode:
            return {}

        with torch.no_grad():
            rgb = pipe.decode_latents(latents)
        pil_image = numpy_to_pil(rgb)[0]

        display = _pixelate_image(pil_image, pixel_size=PIXEL_SIZE)
        frame_path = output_dir / f"{job_id}-step-{step_idx:03d}.png"
        display.save(frame_path)

        relative = frame_path.relative_to(public_root).as_posix()
        progress = int(((step_idx + 1) / total_steps) * 100)
        emit(
            {
                "type": "progress",
                "progress": min(progress, 99),
                "imageUrl": f"/generated/{relative}",
            }
        )
        return {}

    image = pipe(
        prompt=prompt,
        width=SIZE,
        height=SIZE,
        generator=generator,
        guidance_scale=GUIDANCE_SCALE,
        num_inference_steps=NUM_STEPS,
        callback_on_step_end=callback_on_step_end,
        callback_on_step_end_tensor_inputs=["latents"],
    ).images[0]

    final_display = _pixelate_image(image, pixel_size=PIXEL_SIZE)
    final_path = output_dir / f"{job_id}-final.png"
    final_display.save(final_path)
    relative = final_path.relative_to(public_root).as_posix()
    emit({"type": "completed", "progress": 100, "imageUrl": f"/generated/{relative}"})


def generate(prompt, output_dir, public_root, job_id, seed=None):
    pipe = _load_pipeline()
    pipe = pipe.to("cpu")
    generate_with_pipe(pipe, prompt, output_dir, public_root, job_id, seed=seed)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--job-id", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--prompt", required=False, default="")
    parser.add_argument("--seed", required=False, type=int)
    args = parser.parse_args()

    prompt = args.prompt.strip() if args.prompt else ""
    if not prompt:
        prompt = _build_prompt()

    output_dir = Path(args.output_dir).resolve()
    public_root = output_dir.parent.resolve()

    try:
        generate(prompt, output_dir, public_root, args.job_id, seed=args.seed)
    except Exception as error:
        emit({"type": "error", "error": str(error)})
        raise


if __name__ == "__main__":
    os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
    main()
