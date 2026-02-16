import { Router } from "express";
import { fileURLToPath } from "url";
import { loadJson, rootPath } from "../utils/loadJson.js";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Server is up!!" });
});

router.get("/resume", (_req, res) => {
  const filePath = path.join(__dirname, "..", "..", "assets", "resume.pdf");
  res.download(filePath, "Diego_Pedroza_Resume.pdf");
})

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