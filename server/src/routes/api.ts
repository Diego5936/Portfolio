import { Router } from "express";
import {
  attachDiffusionSession,
  getDiffusionSessionView,
} from "../services/diffusionGeneration.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Server is up!!" });
});

router.post("/diffusion/session", (req, res) => {
  const { sessionId, visitDateISO, timezone } = req.body ?? {};
  const job = attachDiffusionSession({ sessionId, visitDateISO, timezone });

  res.status(202).json({
    ok: true,
    job,
    message: "Diffusion session attached.",
  });
});

router.get("/diffusion/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const job = getDiffusionSessionView(sessionId);

  if (!job) {
    res.status(404).json({
      ok: false,
      message: "Diffusion session not found.",
    });
    return;
  }

  res.json({
    ok: true,
    job,
  });
});

export default router;
