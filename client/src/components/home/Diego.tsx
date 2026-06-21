import { ChevronDown } from "lucide-react";

export function Diego() {
  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Hello, I'm Diego!
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Computer Science Student @ UCF, Embodied AI / Robotics Researcher, Systems Engineer, Software Engineer 
      </p>
      <button
        type="button"
        onClick={scrollToAbout}
        className="mt-8 flex w-full flex-col items-center transition-opacity hover:opacity-90"
      >
        <span className="portfolio-continue-below-cue flex flex-col items-center">
          <span>Continue Below</span>
          <ChevronDown strokeWidth={2.5} aria-hidden />
        </span>
      </button>
    </>
  );
}
