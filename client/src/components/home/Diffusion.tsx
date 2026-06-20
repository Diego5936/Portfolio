import { Button } from "@/components/ui/button";
import meImage from "@/assets/me.jpg";
import { useEffect, useMemo, useRef, useState } from "react";

type DiffusionGenerationStatus = "queued" | "running" | "completed" | "failed";

interface DiffusionGenerationJob {
  id: string;
  prompt: string;
  status: DiffusionGenerationStatus;
  progress: number;
  imageUrl: string | null;
  error: string | null;
}

export function DiffusionPanel() {
  const diffusionEnabled = false;
  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001",
    [],
  );
  const [job, setJob] = useState<DiffusionGenerationJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!diffusionEnabled) {
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    let isMounted = true;
    let pollTimer: number | undefined;

    async function createJob() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/diffusion/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitDateISO: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });

        if (!response.ok) {
          throw new Error("Could not start diffusion image generation.");
        }

        const payload = (await response.json()) as { job: DiffusionGenerationJob };
        if (!isMounted) return;

        setJob(payload.job);
        setIsLoading(false);

        pollTimer = window.setInterval(async () => {
          const pollResponse = await fetch(
            `${apiBaseUrl}/api/diffusion/generate/${payload.job.id}`,
          );

          if (!pollResponse.ok || !isMounted) return;

          const pollPayload = (await pollResponse.json()) as {
            job: DiffusionGenerationJob;
          };

          setJob(pollPayload.job);

          if (
            pollPayload.job.status === "completed" ||
            pollPayload.job.status === "failed"
          ) {
            if (pollTimer) {
              window.clearInterval(pollTimer);
            }
          }
        }, 1200);
      } catch (error) {
        if (!isMounted) return;

        setIsLoading(false);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not start diffusion image generation.",
        );
      }
    }

    createJob();

    return () => {
      isMounted = false;
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
    };
  }, [apiBaseUrl]);

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-sm">
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
          style={{ opacity: Math.max(0, 1 - (job?.progress ?? 0) / 100) }}
        />

        <div className="relative flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-2xl border-2 border-background/70 bg-background/90 shadow-md">
              <img
                src={meImage}
                alt="Diego portrait"
                className="h-full w-full object-cover object-center"
              />
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {isLoading && "Starting diffusion generation..."}
              {!isLoading && loadError && loadError}
              {!isLoading && !loadError && job
                ? `Generating diffusion background: ${job.progress}%`
                : ""}
            </p>

            {job?.prompt ? (
              <p className="mx-auto mt-2 max-w-[80%] text-xs text-muted-foreground/80">
                {job.prompt}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-2xl bg-orange-600/20 blur-2xl" />
      <div className="pointer-events-none absolute -top-6 -right-6 h-28 w-28 rounded-full bg-fuchsia-900/25 blur-2xl" />
    </div>
  );
}

export function HeroIntro() {
  return (
    <>
      <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Hello, I'm Diego!
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Computer Science Student @ UCF, AI Researcher, Software Engineer
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button asChild>
          <a href="/projects">Explore projects</a>
        </Button>
        <Button asChild variant="outline">
          <a href="#about">About me</a>
        </Button>
      </div>
    </>
  );
}
