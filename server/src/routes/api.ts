import { Router } from "express";
import { loadJson, rootPath } from "../utils/loadJson.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Server is up!!" });
});

router.get("/projects", (_req, res) => {
  try {
    const data = loadJson(rootPath("data", "projects.json"));
    res.json(data);
  } catch {
    res.status(500).json({ ok: false, error: "Failed to read projects.json" });
  }
});

router.get("/skills", (_req, res) => {
  try {
    const data = loadJson(rootPath("data", "skills.json"));
    res.json(data);
  } catch {
    res.status(500).json({ ok: false, error: "Failed to read skills.json" });
  }
});

export default router;