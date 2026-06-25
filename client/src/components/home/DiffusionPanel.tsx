import { useDiffusionJob } from "@/components/home/useDiffusionJob";
import { useMemo } from "react";

const BRIGHT_GRADIENT_COLORS = [
  "#ff006e",
  "#fb5607",
  "#ffbe0b",
  "#8338ec",
  "#3a86ff",
  "#06ffa5",
  "#ff0099",
  "#00f5ff",
  "#7bff00",
  "#ff3864",
  "#ffd60a",
  "#4cc9f0",
] as const;

function buildRandomBrightGradient() {
  const picks = [...BRIGHT_GRADIENT_COLORS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  return `linear-gradient(90deg, ${picks.join(", ")})`;
}

export function DiffusionPanel() {
  const { job, isLoading, loadError, apiBaseUrl } = useDiffusionJob();
  const progressGradient = useMemo(() => buildRandomBrightGradient(), []);

  const progress = job?.progress ?? 0;
  const showProgressBar =
    !loadError &&
    (isLoading || job?.status === "queued" || job?.status === "running");

  return (
    <div className="portfolio-diffusion-panel relative h-full w-full">
      <div className="portfolio-diffusion-frame relative h-full w-full overflow-hidden rounded-xl">
        <div className="portfolio-sunset-bg absolute inset-0" />

        {job?.imageUrl ? (
          <img
            src={
              job.imageUrl.startsWith("http")
                ? job.imageUrl
                : `${apiBaseUrl}${job.imageUrl}`
            }
            alt="AI-generated diffusion background"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <div
          className="absolute inset-0 bg-black/25 transition-all duration-700"
          style={{ opacity: Math.max(0, 1 - progress / 100) }}
        />

        {showProgressBar ? (
          <>
            <p
              className="portfolio-diffusion-status absolute bottom-2 right-2 z-10 text-[0.65rem] leading-tight sm:text-xs"
              aria-live="polite"
            >
              Generating Diffusion Image
              <span className="portfolio-diffusion-status-dots" aria-hidden />
            </p>
            <div
              className="absolute inset-x-0 bottom-0 h-2 bg-black/35"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Diffusion generation progress"
            >
              <div
                className="h-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${Math.max(isLoading && !job ? 4 : progress, 0)}%`,
                  background: progressGradient,
                }}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
