import { Router } from "express";
import {
  getDiffusionGenerationJob,
  startDiffusionGeneration,
} from "../services/diffusionGeneration.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Server is up!!" });
});

router.post("/diffusion/generate", (req, res) => {
  const { visitDateISO, timezone } = req.body ?? {};
  const job = startDiffusionGeneration({ visitDateISO, timezone });

  res.status(202).json({
    ok: true,
    job,
    message: "Diffusion image generation started.",
  });
});

router.get("/diffusion/generate/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = getDiffusionGenerationJob(jobId);

  if (!job) {
    res.status(404).json({
      ok: false,
      message: "Diffusion generation job not found.",
    });
    return;
  }

  res.json({
    ok: true,
    job,
  });
});

export default router;
