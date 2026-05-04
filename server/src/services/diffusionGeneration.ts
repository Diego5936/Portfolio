import crypto from "node:crypto";
import path from "node:path";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";

type DiffusionGenerationStatus = "queued" | "running" | "completed" | "failed";

export interface DiffusionGenerationJob {
  id: string;
  prompt: string;
  status: DiffusionGenerationStatus;
  progress: number;
  createdAt: number;
  imageUrl: string | null;
  error: string | null;
}

const jobs = new Map<string, DiffusionGenerationJob>();
const WORKER_SCRIPT = path.resolve(
  process.cwd(),
  "src",
  "services",
  "diffusion_worker.py",
);
const OUTPUT_DIR = path.resolve(process.cwd(), "public", "generated", "diffusion");
const PUBLIC_GENERATED_ROOT = path.resolve(OUTPUT_DIR, "..");
const DEFAULT_PYTHON_PATH = path.resolve(
  process.cwd(),
  ".venv",
  "Scripts",
  "python.exe",
);

const pendingStart: string[] = [];
let activeWorkerJobId: string | null = null;
let workerProc: ChildProcessWithoutNullStreams | null = null;
let workerReady = false;
let stdoutRest = "";
let workerBootPromise: Promise<void> | null = null;

interface StartDiffusionGenerationInput {
  visitDateISO?: string;
  timezone?: string;
}

type WorkerPayload = {
  type: string;
  message?: string;
  progress?: number;
  imageUrl?: string;
  error?: string;
};

function _getPrompt(weekDay: string, curDate: string, currentTime: string) {
  const DAY_MAPPINGS: Record<string, string> = {
    Monday: "Focused Monday cafe: peace, coffee, books",
    Tuesday: "Inventive Tuesday workshop: science, tools, robots",
    Wednesday: "Curious Wednesday mountains: nature, trails, animals",
    Thursday: "Creative Thursday canvas: floating shapes, paint, flowers",
    Friday: "Electric Friday city: energy, neon lights, music",
    Saturday: "Escape Saturday world: vibrant, magic, dreamy",
    Sunday: "Relaxing Sunday beach: waves, soft clouds, palm trees",
  };

  const hour = Number.parseInt(currentTime, 10);
  const weekdayPrompt = DAY_MAPPINGS[weekDay] ?? DAY_MAPPINGS.Monday;

  let prompt = `Create a cute scene, middle of ${curDate} vibes. Specifically focused on ${weekdayPrompt}. `;

  if (hour < 12) {
    prompt += "In the morning";
  } else if (hour < 18) {
    prompt += "In the afternoon";
  } else if (hour === 19) {
    prompt += "At sunset";
  } else {
    prompt += "At night";
  }

  return prompt;
}

function buildDateBasedPrompt(visitDateISO?: string, timezone?: string) {
  const date = visitDateISO ? new Date(visitDateISO) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  const weekDay = safeDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: timezone,
  });
  const curDate = safeDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });
  const currentTime = safeDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    hour12: false,
    timeZone: timezone,
  });

  return _getPrompt(weekDay, curDate, currentTime);
}

async function cleanOldDiffusionSaves() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
}

function dispatchWorkerPayload(payload: WorkerPayload) {
  const jobId = activeWorkerJobId;
  if (!jobId) {
    console.warn("[diffusion:worker] event with no active job", payload);
    return;
  }

  const job = jobs.get(jobId);
  if (!job) return;

  if (payload.type === "progress") {
    job.progress = payload.progress ?? job.progress;
    if (payload.imageUrl) {
      job.imageUrl = payload.imageUrl;
    }
    job.status = "running";
    return;
  }

  if (payload.type === "completed") {
    job.progress = 100;
    job.status = "completed";
    job.imageUrl = payload.imageUrl ?? job.imageUrl;
    activeWorkerJobId = null;
    void trySendNextJob();
    return;
  }

  if (payload.type === "error") {
    job.status = "failed";
    job.error = payload.error ?? "Diffusion generation failed.";
    activeWorkerJobId = null;
    void trySendNextJob();
  }
}

function failPendingStarts(message: string) {
  for (const id of pendingStart.splice(0)) {
    const j = jobs.get(id);
    if (j && j.status !== "completed") {
      j.status = "failed";
      j.error = message;
    }
  }
}

function onWorkerProcessClosed(code: number | null) {
  workerProc = null;
  workerReady = false;
  stdoutRest = "";

  if (activeWorkerJobId) {
    const job = jobs.get(activeWorkerJobId);
    if (job && job.status !== "completed") {
      job.status = "failed";
      job.error = `Diffusion worker exited (code ${code ?? "unknown"}).`;
    }
    activeWorkerJobId = null;
  }

  failPendingStarts("Diffusion worker stopped.");
}

function spawnWorker(): Promise<void> {
  workerReady = false;
  stdoutRest = "";
  const pythonExecutable = process.env.PYTHON_PATH ?? DEFAULT_PYTHON_PATH;

  const proc = spawn(pythonExecutable, [WORKER_SCRIPT], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
  }) as ChildProcessWithoutNullStreams;

  workerProc = proc;

  let sawReady = false;
  let settledBoot = false;

  proc.stderr.on("data", (chunk: Buffer) => {
    const text = chunk.toString().trim();
    if (text) {
      console.warn(`[diffusion:worker:stderr] ${text}`);
    }
  });

  return new Promise<void>((resolve, reject) => {
    function failBoot(err: Error) {
      if (settledBoot) return;
      settledBoot = true;
      proc.off("error", onBootError);
      proc.off("close", onBootClose);
      workerProc = null;
      workerReady = false;
      reject(err);
    }

    function finishBoot() {
      if (settledBoot) return;
      settledBoot = true;
      proc.off("error", onBootError);
      proc.off("close", onBootClose);
      resolve();
    }

    function onBootError(err: Error) {
      failBoot(err instanceof Error ? err : new Error(String(err)));
    }

    function onBootClose(code: number | null) {
      if (sawReady) return;
      failBoot(
        new Error(`Diffusion worker exited before ready (code ${code})`),
      );
    }

    proc.once("error", onBootError);
    proc.once("close", onBootClose);

    proc.stdout.on("data", (chunk: Buffer) => {
      stdoutRest += chunk.toString();
      const lines = stdoutRest.split("\n");
      stdoutRest = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let payload: WorkerPayload;
        try {
          payload = JSON.parse(trimmed) as WorkerPayload;
        } catch {
          console.log(`[diffusion:worker] ${trimmed}`);
          continue;
        }

        if (payload.type === "warming") {
          console.log("[diffusion:worker]", payload.message ?? "warming");
          continue;
        }

        if (payload.type === "ready") {
          if (!sawReady) {
            sawReady = true;
            workerReady = true;
            finishBoot();
          }
          continue;
        }

        if (!sawReady) {
          continue;
        }

        dispatchWorkerPayload(payload);
      }
    });
  }).finally(() => {
    proc.removeAllListeners("close");
    proc.removeAllListeners("error");
    proc.on("close", (code) => onWorkerProcessClosed(code));
  });
}

function ensureWorkerReady(): Promise<void> {
  if (workerProc && !workerProc.killed && workerReady) {
    return Promise.resolve();
  }
  if (!workerBootPromise) {
    workerBootPromise = spawnWorker().finally(() => {
      workerBootPromise = null;
    });
  }
  return workerBootPromise;
}

async function trySendNextJob() {
  if (activeWorkerJobId !== null) return;
  if (pendingStart.length === 0) return;

  try {
    await ensureWorkerReady();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Diffusion worker failed to start.";
    failPendingStarts(message);
    return;
  }

  if (!workerProc || workerProc.killed || !workerReady) return;

  const jobId = pendingStart.shift();
  if (!jobId) return;

  const job = jobs.get(jobId);
  if (!job) {
    void trySendNextJob();
    return;
  }

  try {
    await cleanOldDiffusionSaves();
  } catch (error) {
    job.status = "failed";
    job.error =
      error instanceof Error
        ? `Could not clean old diffusion saves: ${error.message}`
        : "Could not clean old diffusion saves.";
    void trySendNextJob();
    return;
  }

  activeWorkerJobId = jobId;
  job.status = "running";
  job.error = null;

  const line =
    JSON.stringify({
      action: "generate",
      jobId,
      prompt: job.prompt,
      outputDir: OUTPUT_DIR,
      publicRoot: PUBLIC_GENERATED_ROOT,
    }) + "\n";

  workerProc.stdin.write(line);
}

export function startDiffusionGeneration(
  input: StartDiffusionGenerationInput = {},
) {
  const id = crypto.randomUUID();
  const prompt = buildDateBasedPrompt(input.visitDateISO, input.timezone);

  const job: DiffusionGenerationJob = {
    id,
    prompt,
    status: "queued",
    progress: 0,
    createdAt: Date.now(),
    imageUrl: null,
    error: null,
  };

  jobs.set(id, job);
  pendingStart.push(id);
  void trySendNextJob();

  return job;
}

export function getDiffusionGenerationJob(jobId: string) {
  return jobs.get(jobId) ?? null;
}

export function warmupDiffusionWorker() {
  void ensureWorkerReady()
    .then(() => {
      console.log("[diffusion] worker warmed up (pipeline loaded)");
    })
    .catch((error) => {
      console.warn(
        "[diffusion] warmup failed; first job will attempt to start worker",
        error instanceof Error ? error.message : error,
      );
    });
}
