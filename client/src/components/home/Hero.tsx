import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="home" className="py-14 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Left: Cartoon placeholder */}
        <div className="relative order-2 lg:order-1">
          <div className="aspect-[4/3] w-full rounded-2xl border bg-card shadow-sm">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full border bg-muted" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Cartoon placeholder
                </p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-2xl bg-muted/60 blur-2xl" />
          <div className="pointer-events-none absolute -top-6 -right-6 h-28 w-28 rounded-full bg-muted/60 blur-2xl" />
        </div>

        {/* Right: Intro */}
        <div className="order-1 lg:order-2">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Hello, I'm Diego!
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Computer Science Student @ UCF, AI Researcher, Software Engineer
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <a href="#projects">Explore projects</a>
            </Button>
            <Button asChild variant="outline">
              <a href="#about">About me</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
