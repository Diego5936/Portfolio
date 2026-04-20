import { useState } from "react";
import { projects } from "@/data/projects";
import type { ProjectMedia } from "@/data/projects/types";

export function ProjectsSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = projects.find((project) => project.id === selectedId) ?? null;
  const maxVisibleTechs = 3;
  const getPreviewText = (text: string, maxLength = 130) =>
    text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
  const getProjectPreview = (project: (typeof projects)[number]) =>
    project.descriptionSections[0]?.paragraphs[0] ?? "";
  const renderMedia = (media: ProjectMedia, className: string) => {
    if (media.kind === "video") {
      return (
        <video
          src={media.src}
          poster={media.poster}
          className={className}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }

    return <img src={media.src} alt={media.alt} className={className} loading="lazy" />;
  };

  return (
    <section id="projects" className="py-14 sm:py-20">
      <div className="mb-6">
        <h2 className="portfolio-section-title">Projects</h2>
        <p className="mt-2 text-muted-foreground">Click a project to focus it.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedId(project.id)}
            className="group flex h-full flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
              <span className="text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                Open
              </span>
            </div>

            {project.media[0] && (
              <div className="mt-4 overflow-hidden rounded-xl border bg-muted/20">
                {renderMedia(project.media[0], "h-36 w-full object-cover")}
              </div>
            )}

            {getProjectPreview(project) && (
              <p className="mt-4 text-sm text-muted-foreground">
                {getPreviewText(getProjectPreview(project))}
              </p>
            )}

            <div className="mt-auto pt-4">
              <div className="flex flex-nowrap items-end gap-2 overflow-hidden">
                {project.techs.slice(0, maxVisibleTechs).map((tech) => (
                  <span
                    key={tech}
                    className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
                {project.techs.length > maxVisibleTechs && (
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {project.techs.length - maxVisibleTechs}+
                  </span>
                )}
              </div>
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

              {selected.media.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {selected.media.map((mediaItem) => (
                    <div
                      key={`${selected.id}-${mediaItem.src}`}
                      className="overflow-hidden rounded-xl border bg-muted/20"
                    >
                      {renderMedia(mediaItem, "h-44 w-full object-cover")}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-5">
                {selected.descriptionSections.map((section) => (
                  <div key={`${selected.id}-${section.heading}`}>
                    <h4 className="portfolio-detail-title">{section.heading}</h4>
                    <div className="portfolio-detail-body mt-2 space-y-3">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selected.links.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xl font-semibold tracking-tight">Links</h4>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
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
                </div>
              )}

              {selected.documents && selected.documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xl font-semibold tracking-tight">Documents</h4>
                  <div className="mt-3 space-y-4">
                    {selected.documents.map((document) => (
                      <div key={document.href} className="rounded-xl border bg-muted/10 p-3">
                        <a
                          href={document.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          {document.label} →
                        </a>
                        {document.kind === "pdf" && (
                          <iframe
                            title={document.label}
                            src={`${document.href}#view=FitH`}
                            className="mt-3 h-[28rem] w-full rounded-lg border bg-background"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-xl font-semibold tracking-tight">Skills & Technologies</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.techs.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}