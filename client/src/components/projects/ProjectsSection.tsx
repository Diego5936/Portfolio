import { useState } from "react";
import { projects } from "@/projects";

export function ProjectsSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = projects.find((project) => project.id === selectedId) ?? null;
  const getPreviewText = (text: string, maxLength = 130) =>
    text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;

  return (
    <section id="projects" className="py-14 sm:py-20">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        <p className="mt-2 text-muted-foreground">Click a project to focus it.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedId(project.id)}
            className="group rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
              <span className="text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                Open
              </span>
            </div>

            {project.images[0] && (
              <div className="mt-4 overflow-hidden rounded-xl border bg-muted/20">
                <img
                  src={project.images[0].src}
                  alt={project.images[0].alt}
                  className="h-36 w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {project.highlights[0] && (
              <p className="mt-4 text-sm text-muted-foreground">
                {getPreviewText(project.highlights[0])}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {project.techs.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">{selected.title}</h3>
                </div>

                <button
                  onClick={() => setSelectedId(null)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>

              {selected.images.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {selected.images.map((image) => (
                    <div
                      key={`${selected.id}-${image.src}`}
                      className="overflow-hidden rounded-xl border bg-muted/20"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="h-44 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {selected.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {selected.techs.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {selected.links.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  {selected.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {link.label} →
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}