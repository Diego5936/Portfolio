import crypto from "node:crypto";
import path from "node:path";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";

type DiffusionGenerationStatus = "queued" | "running" | "completed" | "failed";
type SessionMode = "real" | "simulated";

interface DiffusionFrame {
  progress: number;
  imageUrl: string;
  emittedAtMs: number;
}

interface RealJob {
  id: string;
  prompt: string;
  promptKey: string;
  status: DiffusionGenerationStatus;
  progress: number;
  imageUrl: string | null;
  error: string | null;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
  frames: DiffusionFrame[];
}

interface VisitorSession {
  id: string;
  type: SessionMode;
  promptKey: string;
  realJobId?: string;
  sourceJobId?: string;
  simulationStartedAt?: number;
  createdAt: number;
}

export interface DiffusionSessionView {
  id: string;
  prompt: string;
  status: DiffusionGenerationStatus;
  progress: number;
  imageUrl: string | null;
  error: string | null;
  mode: SessionMode;
  sourceJobId?: string;
}

interface AttachDiffusionSessionInput {
  sessionId?: string;
  visitDateISO?: string;
  timezone?: string;
}

const realJobs = new Map<string, RealJob>();
const sessions = new Map<string, VisitorSession>();

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

type WorkerPayload = {
  type: string;
  message?: string;
  progress?: number;
  imageUrl?: string;
  error?: string;
};

function _getTimePeriod(hour: number) {
  if (hour < 12) {
    return "morning";
  }
  if (hour < 18) {
    return "afternoon";
  }
  if (hour === 19) {
    return "sunset";
  }
  return "night";
}

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

function _parseVisitDate(visitDateISO?: string, timezone?: string) {
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
  const hour = Number.parseInt(currentTime, 10);

  return { weekDay, curDate, currentTime, hour };
}

export function buildPromptKey(visitDateISO?: string, timezone?: string) {
  const { weekDay, curDate, hour } = _parseVisitDate(visitDateISO, timezone);
  const timePeriod = _getTimePeriod(hour);
  return `${weekDay}|${timePeriod}|${curDate}`;
}

function buildDateBasedPrompt(visitDateISO?: string, timezone?: string) {
  const { weekDay, curDate, currentTime } = _parseVisitDate(
    visitDateISO,
    timezone,
  );
  return _getPrompt(weekDay, curDate, currentTime);
}

function getJobOutputDir(jobId: string) {
  return path.join(OUTPUT_DIR, jobId);
}

async function cleanJobOutputDir(jobId: string) {
  const dir = getJobOutputDir(jobId);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

function getCurrentlyRunningRealJob(): RealJob | null {
  if (!activeWorkerJobId) {
    return null;
  }

  const job = realJobs.get(activeWorkerJobId);
  if (job?.status === "running") {
    return job;
  }

  return null;
}

function getSourceFinalImage(source: RealJob) {
  if (source.frames.length > 0) {
    return source.frames[source.frames.length - 1]!.imageUrl;
  }

  return source.imageUrl;
}

function getSourceTotalDurationMs(source: RealJob) {
  if (source.completedAt !== null && source.startedAt !== null) {
    return source.completedAt - source.startedAt;
  }

  if (source.frames.length > 0) {
    return source.frames[source.frames.length - 1]!.emittedAtMs;
  }

  return 0;
}

function pickFrameForElapsed(source: RealJob, elapsedMs: number) {
  let currentFrame: DiffusionFrame | null = null;

  for (const frame of source.frames) {
    if (frame.emittedAtMs <= elapsedMs) {
      currentFrame = frame;
    } else {
      break;
    }
  }

  return currentFrame;
}

function computeRealSessionView(session: VisitorSession): DiffusionSessionView | null {
  if (!session.realJobId) {
    return null;
  }

  const job = realJobs.get(session.realJobId);
  if (!job) {
    return null;
  }

  return {
    id: session.id,
    prompt: job.prompt,
    status: job.status,
    progress: job.progress,
    imageUrl: job.imageUrl,
    error: job.error,
    mode: "real",
  };
}

function computeSimulatedSessionView(
  session: VisitorSession,
): DiffusionSessionView | null {
  if (!session.sourceJobId || session.simulationStartedAt === undefined) {
    return null;
  }

  const source = realJobs.get(session.sourceJobId);
  if (!source) {
    return null;
  }

  const elapsedMs = Date.now() - session.simulationStartedAt;
  const totalDurationMs = getSourceTotalDurationMs(source);

  if (source.status === "failed") {
    return {
      id: session.id,
      prompt: source.prompt,
      status: "failed",
      progress: 0,
      imageUrl: null,
      error: source.error,
      mode: "simulated",
      sourceJobId: source.id,
    };
  }

  if (totalDurationMs > 0 && elapsedMs >= totalDurationMs) {
    return {
      id: session.id,
      prompt: source.prompt,
      status: "completed",
      progress: 100,
      imageUrl: getSourceFinalImage(source),
      error: null,
      mode: "simulated",
      sourceJobId: source.id,
    };
  }

  const currentFrame = pickFrameForElapsed(source, elapsedMs);
  const status: DiffusionGenerationStatus =
    source.status === "queued" && source.frames.length === 0
      ? "queued"
      : "running";

  return {
    id: session.id,
    prompt: source.prompt,
    status,
    progress: currentFrame?.progress ?? 0,
    imageUrl: currentFrame?.imageUrl ?? null,
    error: null,
    mode: "simulated",
    sourceJobId: source.id,
  };
}

function computeSessionView(session: VisitorSession): DiffusionSessionView | null {
  if (session.type === "real") {
    return computeRealSessionView(session);
  }

  return computeSimulatedSessionView(session);
}

function createRealJob(promptKey: string, prompt: string): RealJob {
  const job: RealJob = {
    id: crypto.randomUUID(),
    prompt,
    promptKey,
    status: "queued",
    progress: 0,
    imageUrl: null,
    error: null,
    createdAt: Date.now(),
    startedAt: null,
    completedAt: null,
    frames: [],
  };

  realJobs.set(job.id, job);
  return job;
}

function assignSession(
  sessionId: string,
  promptKey: string,
  visitDateISO?: string,
  timezone?: string,
): DiffusionSessionView {
  const runningReal = getCurrentlyRunningRealJob();

  if (runningReal) {
    const session: VisitorSession = {
      id: sessionId,
      type: "simulated",
      promptKey,
      sourceJobId: runningReal.id,
      simulationStartedAt: Date.now(),
      createdAt: Date.now(),
    };
    sessions.set(sessionId, session);
    return computeSessionView(session)!;
  }

  const prompt = buildDateBasedPrompt(visitDateISO, timezone);
  const realJob = createRealJob(promptKey, prompt);
  const session: VisitorSession = {
    id: sessionId,
    type: "real",
    promptKey,
    realJobId: realJob.id,
    createdAt: Date.now(),
  };

  sessions.set(sessionId, session);
  pendingStart.push(realJob.id);
  void trySendNextJob();

  return computeSessionView(session)!;
}

export function attachDiffusionSession(input: AttachDiffusionSessionInput = {}) {
  const promptKey = buildPromptKey(input.visitDateISO, input.timezone);
  const sessionId = input.sessionId ?? crypto.randomUUID();

  if (input.sessionId) {
    const existing = sessions.get(input.sessionId);
    if (existing) {
      const view = computeSessionView(existing);

      if (view && view.status !== "failed" && existing.promptKey === promptKey) {
        return view;
      }
    }
  }

  return assignSession(sessionId, promptKey, input.visitDateISO, input.timezone);
}

export function getDiffusionSessionView(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  return computeSessionView(session);
}

function dispatchWorkerPayload(payload: WorkerPayload) {
  const jobId = activeWorkerJobId;
  if (!jobId) {
    console.warn("[diffusion:worker] event with no active job", payload);
    return;
  }

  const job = realJobs.get(jobId);
  if (!job) return;

  if (payload.type === "progress") {
    job.progress = payload.progress ?? job.progress;
    if (payload.imageUrl) {
      job.imageUrl = payload.imageUrl;

      const emittedAtMs =
        job.startedAt !== null ? Date.now() - job.startedAt : 0;
      job.frames.push({
        progress: job.progress,
        imageUrl: payload.imageUrl,
        emittedAtMs,
      });
    }
    job.status = "running";
    return;
  }

  if (payload.type === "completed") {
    job.progress = 100;
    job.status = "completed";
    job.completedAt = Date.now();
    job.imageUrl = payload.imageUrl ?? job.imageUrl;

    if (payload.imageUrl) {
      const emittedAtMs =
        job.startedAt !== null ? Date.now() - job.startedAt : 0;
      const lastFrame = job.frames[job.frames.length - 1];
      if (!lastFrame || lastFrame.imageUrl !== payload.imageUrl) {
        job.frames.push({
          progress: 100,
          imageUrl: payload.imageUrl,
          emittedAtMs,
        });
      }
    }

    activeWorkerJobId = null;
    void trySendNextJob();
    return;
  }

  if (payload.type === "error") {
    job.status = "failed";
    job.error = payload.error ?? "Diffusion generation failed.";
    job.completedAt = Date.now();
    activeWorkerJobId = null;
    void trySendNextJob();
  }
}

function failPendingStarts(message: string) {
  for (const id of pendingStart.splice(0)) {
    const job = realJobs.get(id);
    if (job && job.status !== "completed") {
      job.status = "failed";
      job.error = message;
      job.completedAt = Date.now();
    }
  }
}

function onWorkerProcessClosed(code: number | null) {
  workerProc = null;
  workerReady = false;
  stdoutRest = "";

  if (activeWorkerJobId) {
    const job = realJobs.get(activeWorkerJobId);
    if (job && job.status !== "completed") {
      job.status = "failed";
      job.error = `Diffusion worker exited (code ${code ?? "unknown"}).`;
      job.completedAt = Date.now();
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

  const job = realJobs.get(jobId);
  if (!job) {
    void trySendNextJob();
    return;
  }

  try {
    await cleanJobOutputDir(jobId);
  } catch (error) {
    job.status = "failed";
    job.error =
      error instanceof Error
        ? `Could not clean job output: ${error.message}`
        : "Could not clean job output.";
    job.completedAt = Date.now();
    void trySendNextJob();
    return;
  }

  activeWorkerJobId = jobId;
  job.status = "running";
  job.startedAt = Date.now();
  job.error = null;

  const line =
    JSON.stringify({
      action: "generate",
      jobId,
      prompt: job.prompt,
      outputDir: getJobOutputDir(jobId),
      publicRoot: PUBLIC_GENERATED_ROOT,
    }) + "\n";

  workerProc.stdin.write(line);
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
