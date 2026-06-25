import type { DiffusionGenerationJob } from "@/lib/diffusionTypes";

export interface DiffusionFallbackFrame {
  step: number;
  progress: number;
  filename: string;
  imageUrl: string;
  emittedAtMs: number;
}

export interface DiffusionFallbackBundle {
  id: string;
  promptKey: string;
  prompt: string;
  totalDurationMs: number;
  finalImageUrl: string;
  frames: DiffusionFallbackFrame[];
}

const FALLBACK_ROOT = "/generated/diffusion-fallback";

const bundleCache = new Map<string, DiffusionFallbackBundle>();

export function resolveDiffusionImageUrl(
  imageUrl: string,
  apiBaseUrl: string,
) {
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  if (imageUrl.startsWith(`${FALLBACK_ROOT}/`)) {
    return imageUrl;
  }

  return `${apiBaseUrl}${imageUrl}`;
}

export async function loadFallbackBundle(
  slug: string,
): Promise<DiffusionFallbackBundle | null> {
  const cached = bundleCache.get(slug);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${FALLBACK_ROOT}/${slug}/metadata.json`);
  if (!response.ok) {
    return null;
  }

  const bundle = (await response.json()) as DiffusionFallbackBundle;
  bundleCache.set(slug, bundle);
  return bundle;
}

function pickFrameForElapsed(
  frames: DiffusionFallbackFrame[],
  elapsedMs: number,
) {
  let currentFrame: DiffusionFallbackFrame | null = null;

  for (const frame of frames) {
    if (frame.emittedAtMs <= elapsedMs) {
      currentFrame = frame;
    } else {
      break;
    }
  }

  return currentFrame;
}

export function buildFallbackJobView(
  bundle: DiffusionFallbackBundle,
  simulationStartedAt: number,
): DiffusionGenerationJob {
  const elapsedMs = Math.max(0, Date.now() - simulationStartedAt);

  if (elapsedMs >= bundle.totalDurationMs) {
    return {
      id: bundle.id,
      prompt: bundle.prompt,
      status: "completed",
      progress: 100,
      imageUrl: bundle.finalImageUrl,
      error: null,
      mode: "fallback",
    };
  }

  const currentFrame = pickFrameForElapsed(bundle.frames, elapsedMs);

  return {
    id: bundle.id,
    prompt: bundle.prompt,
    status: "running",
    progress: currentFrame?.progress ?? 0,
    imageUrl: currentFrame?.imageUrl ?? null,
    error: null,
    mode: "fallback",
  };
}
