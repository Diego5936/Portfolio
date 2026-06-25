import { picPortrait } from "@/data/myPics";
import { ChevronDown } from "lucide-react";

export function Diego() {
  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="portfolio-diego-section flex min-h-[calc(100dvh-var(--portfolio-header-height))] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="portfolio-diego-avatar mb-6 overflow-hidden rounded-full border-2 border-white/15 shadow-lg shadow-black/25">
          <img src={picPortrait} alt="Diego Pedroza" />
        </div>
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
        className="flex w-full flex-col items-center transition-opacity hover:opacity-90"
      >
        <span className="portfolio-continue-below-cue flex flex-col items-center">
          <span>Continue Below</span>
          <ChevronDown strokeWidth={2.5} aria-hidden />
        </span>
      </button>
    </div>
  );
}
