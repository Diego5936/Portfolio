"""
Long-lived process: loads the diffusion pipeline once (warmup), then reads
JSON lines from stdin with jobs. Emits the same JSON events as the one-shot
script so Node can parse stdout unchanged.
"""
import json
import os
import sys
from pathlib import Path

_SERVICES_DIR = Path(__file__).resolve().parent
if str(_SERVICES_DIR) not in sys.path:
    sys.path.insert(0, str(_SERVICES_DIR))

from diffusion_generator import _load_pipeline, emit, generate_with_pipe


def main():
    os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

    emit({"type": "warming", "message": "Loading pipeline (warmup)..."})
    pipe = _load_pipeline()
    pipe = pipe.to("cpu")
    emit({"type": "ready"})

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue

        action = msg.get("action")
        if action == "shutdown":
            break

        if action != "generate":
            continue

        job_id = msg["jobId"]
        prompt = msg["prompt"]
        output_dir = Path(msg["outputDir"]).resolve()
        public_root = Path(msg["publicRoot"]).resolve()
        seed = msg.get("seed")

        try:
            generate_with_pipe(
                pipe,
                prompt,
                output_dir,
                public_root,
                job_id,
                seed=seed,
            )
        except Exception as error:
            emit({"type": "error", "error": str(error)})


if __name__ == "__main__":
    main()
