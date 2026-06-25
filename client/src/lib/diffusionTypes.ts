export type DiffusionGenerationStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export type DiffusionSessionMode = "real" | "simulated" | "fallback";

export interface DiffusionGenerationJob {
  id: string;
  prompt: string;
  status: DiffusionGenerationStatus;
  progress: number;
  imageUrl: string | null;
  error: string | null;
  mode?: DiffusionSessionMode;
  sourceJobId?: string;
}
