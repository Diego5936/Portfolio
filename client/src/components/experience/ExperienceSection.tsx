import { experiences } from "@/data/experience/index";

export function ExperienceSection() {
  return (
    <section id="experience" className="py-14 sm:py-20">
      <div className="mb-6">
        <h2 className="portfolio-section-title">Experience</h2>
        <p className="mt-2 text-muted-foreground">
          Professional and research opportunities.
        </p>
      </div>

      <div className="space-y-8">
        {experiences.map((experience) => (
          <article
            key={`${experience.organization}-${experience.role}`}
            className="grid grid-cols-[7rem_1fr] gap-4 md:grid-cols-[10rem_1fr]"
          >
            <div className="relative">
              <div className="pr-4 text-right text-xs leading-snug text-muted-foreground md:text-sm">
                <p>{experience.dateEnd}</p>
                <p className="mt-0.5">{experience.dateStart}</p>
              </div>
              <span className="absolute right-0 top-0 h-full w-px bg-border" />
              <span className="absolute right-0 top-2 h-3 w-3 -translate-x-1/2 rounded-full border border-border bg-background" />
            </div>

            <div className="h-[34rem] overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="h-[45%] overflow-hidden border-b bg-muted/20">
                {experience.posterKind === "video" ? (
                  <video
                    src={experience.posterSrc}
                    className="h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={experience.posterSrc}
                    alt={experience.posterAlt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="relative flex h-[55%] flex-col p-5 pt-16">
                <div className="absolute left-5 top-0 h-28 w-28 -translate-y-[65%] shrink-0 overflow-hidden rounded-xl border bg-card">
                  <img
                    src={experience.logoSrc}
                    alt={experience.logoAlt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="portfolio-detail-title mt-2">
                  {experience.organization} | {experience.role}
                </p>
                <div className="portfolio-detail-body mt-3 space-y-3 overflow-y-auto">
                  {experience.highlights.map((highlight) => (
                    <p key={highlight}>{highlight}</p>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
