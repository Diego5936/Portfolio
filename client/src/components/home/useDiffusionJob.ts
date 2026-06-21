import { useEffect, useState } from "react";

type DiffusionGenerationStatus = "queued" | "running" | "completed" | "failed";
type SessionMode = "real" | "simulated";

export interface DiffusionGenerationJob {
  id: string;
  prompt: string;
  status: DiffusionGenerationStatus;
  progress: number;
  imageUrl: string | null;
  error: string | null;
  mode?: SessionMode;
  sourceJobId?: string;
}

type DiffusionSessionState = {
  job: DiffusionGenerationJob | null;
  isLoading: boolean;
  loadError: string | null;
};

type Listener = (state: DiffusionSessionState) => void;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const SESSION_STORAGE_KEY = "portfolio:diffusion-session-id";

let sessionState: DiffusionSessionState = {
  job: null,
  isLoading: true,
  loadError: null,
};
const listeners = new Set<Listener>();
let sessionStarted = false;
let pollTimer: number | undefined;

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

async function fetchSession(
  sessionId: string,
): Promise<DiffusionGenerationJob | null> {
  const response = await fetch(
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

function stopPolling() {
  if (pollTimer) {
    window.clearInterval(pollTimer);
    pollTimer = undefined;
  }
}

function startPolling(sessionId: string) {
  stopPolling();
  pollTimer = window.setInterval(() => {
    void pollSession(sessionId);
  }, 1200);
}

async function pollSession(sessionId: string) {
  try {
    const job = await fetchSession(sessionId);
    if (!job) return;

    updateSessionState({ job });

    if (job.status === "completed" || job.status === "failed") {
      stopPolling();
    }
  } catch {
    // Keep polling on transient network errors.
  }
}

function attachToSession(job: DiffusionGenerationJob) {
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

async function attachOrCreateSession() {
  const response = await fetch(`${apiBaseUrl}/api/diffusion/session`, {
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
  attachToSession(payload.job);
}

async function resumeOrStartSession() {
  if (sessionStarted) return;
  sessionStarted = true;

  try {
    await attachOrCreateSession();
  } catch (error) {
    sessionStarted = false;
    updateSessionState({
      isLoading: false,
      loadError:
        error instanceof Error
          ? error.message
          : "Could not start diffusion session.",
    });
  }
}

function ensureDiffusionSession() {
  if (
    sessionState.job?.status === "completed" ||
    sessionState.job?.status === "failed"
  ) {
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
