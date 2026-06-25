import { useEffect, useState } from "react";

import {
  buildFallbackJobView,
  loadFallbackBundle,
} from "@/lib/diffusionFallback";
import { buildPromptBucket, promptBucketToSlug } from "@/lib/diffusionPrompt";
import type { DiffusionGenerationJob } from "@/lib/diffusionTypes";

export type {
  DiffusionGenerationJob,
  DiffusionGenerationStatus,
  DiffusionSessionMode,
} from "@/lib/diffusionTypes";

type DiffusionSessionState = {
  job: DiffusionGenerationJob | null;
  isLoading: boolean;
  loadError: string | null;
};

type Listener = (state: DiffusionSessionState) => void;

interface FallbackPersistedState {
  promptBucket: string;
  simulationStartedAt: number;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const SERVER_FETCH_TIMEOUT_MS = 4_000;
const SESSION_STORAGE_KEY = "portfolio:diffusion-session-id";
const FALLBACK_STORAGE_KEY = "portfolio:diffusion-fallback";

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    SERVER_FETCH_TIMEOUT_MS,
  );

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

let sessionState: DiffusionSessionState = {
  job: null,
  isLoading: true,
  loadError: null,
};
const listeners = new Set<Listener>();
let sessionStarted = false;
let pollTimer: number | undefined;
let fallbackTickTimer: number | undefined;
let activeFallback:
  | {
      bundle: NonNullable<Awaited<ReturnType<typeof loadFallbackBundle>>>;
      simulationStartedAt: number;
    }
  | null = null;
let fallbackLoadPromise: Promise<void> | null = null;

function notifyListeners() {
  const snapshot = { ...sessionState };
  for (const listener of listeners) {
    listener(snapshot);
  }
}

function updateSessionState(patch: Partial<DiffusionSessionState>) {
  sessionState = { ...sessionState, ...patch };
  notifyListeners();
}

function readStoredSessionId() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeSessionId(sessionId: string) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

function readFallbackState(): FallbackPersistedState | null {
  try {
    const raw = sessionStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as FallbackPersistedState;
    if (
      typeof parsed.promptBucket !== "string" ||
      typeof parsed.simulationStartedAt !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeFallbackState(state: FallbackPersistedState) {
  try {
    sessionStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

function stopPolling() {
  if (pollTimer) {
    window.clearInterval(pollTimer);
    pollTimer = undefined;
  }
}

function stopFallbackTick() {
  if (fallbackTickTimer) {
    window.clearInterval(fallbackTickTimer);
    fallbackTickTimer = undefined;
  }
}

function stopAllTimers() {
  stopPolling();
  stopFallbackTick();
}

async function fetchSession(
  sessionId: string,
): Promise<DiffusionGenerationJob | null> {
  const response = await fetchWithTimeout(
    `${apiBaseUrl}/api/diffusion/session/${sessionId}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not load diffusion session.");
  }

  const payload = (await response.json()) as { job: DiffusionGenerationJob };
  return payload.job;
}

function startPolling(sessionId: string) {
  stopAllTimers();
  pollTimer = window.setInterval(() => {
    void pollSession(sessionId);
  }, 1200);
}

function tickFallbackSimulation() {
  if (!activeFallback?.bundle) {
    return;
  }

  const job = buildFallbackJobView(
    activeFallback.bundle,
    activeFallback.simulationStartedAt,
  );
  updateSessionState({ job });

  if (job.status === "completed") {
    stopFallbackTick();
  }
}

function startFallbackTick() {
  stopFallbackTick();
  tickFallbackSimulation();
  fallbackTickTimer = window.setInterval(tickFallbackSimulation, 400);
}

async function pollSession(sessionId: string) {
  try {
    const job = await fetchSession(sessionId);
    if (!job) {
      return;
    }

    if (job.status === "failed") {
      stopPolling();
      await startFallbackSession();
      return;
    }

    updateSessionState({ job });

    if (job.status === "completed") {
      stopPolling();
    }
  } catch {
    stopPolling();
    await startFallbackSession();
  }
}

function attachToServerSession(job: DiffusionGenerationJob) {
  activeFallback = null;
  stopFallbackTick();
  try {
    sessionStorage.removeItem(FALLBACK_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
  storeSessionId(job.id);
  sessionStarted = true;

  updateSessionState({
    job,
    isLoading: false,
    loadError: null,
  });

  if (job.status === "queued" || job.status === "running") {
    startPolling(job.id);
    void pollSession(job.id);
  }
}

async function startFallbackSession() {
  if (sessionState.job?.mode === "fallback" || fallbackLoadPromise) {
    return fallbackLoadPromise ?? Promise.resolve();
  }

  fallbackLoadPromise = (async () => {
    const visitDateISO = new Date().toISOString();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const promptBucket = buildPromptBucket(visitDateISO, timezone);
    const slug = promptBucketToSlug(promptBucket);

    const bundle = await loadFallbackBundle(slug);
    if (!bundle) {
      sessionStarted = false;
      updateSessionState({
        isLoading: false,
        loadError: "Diffusion is unavailable and no fallback bundle was found.",
      });
      return;
    }

    const stored = readFallbackState();
    const simulationStartedAt =
      stored?.promptBucket === promptBucket
        ? stored.simulationStartedAt
        : Date.now();

    writeFallbackState({ promptBucket, simulationStartedAt });

    activeFallback = { bundle, simulationStartedAt };
    sessionStarted = true;

    const job = buildFallbackJobView(bundle, simulationStartedAt);
    updateSessionState({
      job,
      isLoading: false,
      loadError: null,
    });

    if (job.status !== "completed") {
      startFallbackTick();
    }
  })().finally(() => {
    fallbackLoadPromise = null;
  });

  return fallbackLoadPromise;
}

async function attachOrCreateServerSession() {
  const response = await fetchWithTimeout(`${apiBaseUrl}/api/diffusion/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: readStoredSessionId() ?? undefined,
      visitDateISO: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not start diffusion session.");
  }

  const payload = (await response.json()) as { job: DiffusionGenerationJob };

  if (payload.job.status === "failed") {
    throw new Error(payload.job.error ?? "Diffusion generation failed.");
  }

  attachToServerSession(payload.job);
}

async function resumeOrStartSession() {
  if (sessionStarted) {
    return;
  }
  sessionStarted = true;

  try {
    await attachOrCreateServerSession();
  } catch {
    sessionStarted = false;
    await startFallbackSession();
  }
}

function ensureDiffusionSession() {
  if (sessionState.job?.status === "completed") {
    return;
  }

  if (sessionState.job?.status === "failed") {
    if (sessionState.job.mode !== "fallback") {
      void startFallbackSession();
    }
    return;
  }

  if (sessionState.job?.mode === "fallback") {
    if (!fallbackTickTimer && sessionState.job.status === "running") {
      if (!activeFallback) {
        void startFallbackSession();
        return;
      }
      startFallbackTick();
    }
    return;
  }

  if (sessionState.job && !pollTimer) {
    startPolling(sessionState.job.id);
    void pollSession(sessionState.job.id);
    return;
  }

  if (sessionStarted) {
    return;
  }

  void resumeOrStartSession();
}

export function useDiffusionJob() {
  const [state, setState] = useState<DiffusionSessionState>(sessionState);

  useEffect(() => {
    const listener: Listener = (nextState) => {
      setState(nextState);
    };

    listeners.add(listener);
    setState({ ...sessionState });
    ensureDiffusionSession();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { ...state, apiBaseUrl };
}
