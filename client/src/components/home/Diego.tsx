import { ChevronDown } from "lucide-react";

export function Diego() {
  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-[calc(100dvh-var(--portfolio-header-height))] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Hello, I'm Diego!
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Computer Science Student @ UCF, Embodied AI / Robotics Researcher, Software Engineer
        </p>
      </div>
      <button
        type="button"
        onClick={scrollToAbout}
        className="flex w-full flex-col items-center pb-12 transition-opacity hover:opacity-90 sm:pb-16 lg:pb-20"
      >
        <span className="portfolio-continue-below-cue flex flex-col items-center">
          <span>Continue Below</span>
          <ChevronDown strokeWidth={2.5} aria-hidden />
        </span>
      </button>
    </div>
  );
}
