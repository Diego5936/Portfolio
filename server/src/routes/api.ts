import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Server is up!!" });
});

export default router;