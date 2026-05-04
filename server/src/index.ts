import express from "express";
import cors from "cors";
import path from "node:path";
import apiRouter from "./routes/api.js";
import { warmupDiffusionWorker } from "./services/diffusionGeneration.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/generated",
  express.static(path.resolve(process.cwd(), "public", "generated")),
);

app.use("/api", apiRouter);

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  warmupDiffusionWorker();
});