import { useEffect, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { projects } from "@/data/projects";
import type { Project, ProjectMedia } from "@/data/projects/types";

function projectSurfaceStyle(project: Project): CSSProperties {
  return {
    backgroundColor: project.panelColor,
    borderColor: project.accentColor,
    ...(project.textColor
      ? {
          color: project.textColor,
          ["--portfolio-text-muted" as string]: project.textColor,
          ["--portfolio-scroll-thumb" as string]: "rgba(255, 255, 255, 0.32)",
          ["--portfolio-scroll-thumb-hover" as string]: "rgba(255, 255, 255, 0.5)",
        }
      : {}),
  };
}

function techPillClassName(project: Project, extra = "") {
  return project.accentColor
    ? `shrink-0 rounded-full px-2.5 py-1 text-xs ${extra}`.trim()
    : `shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground ${extra}`.trim();
}

function techPillStyle(project: Project): CSSProperties | undefined {
  if (!project.accentColor) return undefined;
  return {
    backgroundColor: project.accentColor,
    color: project.textColor,
  };
}

function mutedLinkClassName(project: Project) {
  return project.textColor
    ? "text-sm opacity-80 transition hover:opacity-100"
    : "text-sm text-muted-foreground hover:text-foreground";
}

export function ProjectsSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const selected = projects.find((project) => project.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId) setMediaIndex(0);
  }, [selectedId]);
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

  const shouldShowDualPreview = (project: (typeof projects)[number]) =>
    project.media.length > 1 && project.media[0].isSquare && project.media[1].isSquare;

  return (
    <section id="projects" className="pb-14 pt-6 sm:pb-20 sm:pt-8">
      <h2 className="mb-6 text-center text-4xl font-semibold tracking-tight sm:text-5xl">
        Projects
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedId(project.id)}
            className="project-card group h-full border shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
            style={projectSurfaceStyle(project)}
          >
            <div className="project-card-tab-row">
              <div className="project-card-tab">
                <h3 className="project-card-title">{project.title}</h3>
              </div>
              <div className="project-card-tab-rail" aria-hidden="true" />
            </div>

            {project.media[0] && (
              <div className="project-card-media">
                {shouldShowDualPreview(project) ? (
                  <div className="project-card-dual-preview">
                    {[project.media[0], project.media[1]].map((media) => (
                      <div key={media.src} className="project-card-dual-preview-item">
                        {renderMedia(media, "h-full w-full object-cover")}
                      </div>
                    ))}
                  </div>
                ) : (
                  renderMedia(project.media[0], "aspect-[16/10] h-auto w-full object-cover")
                )}
              </div>
            )}

            <div className="project-card-body">
              {getProjectPreview(project) && (
                <p
                  className={
                    project.textColor
                      ? "text-sm opacity-80"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {getPreviewText(getProjectPreview(project))}
                </p>
              )}

              <div className="project-card-techs">
                {project.techs.slice(0, maxVisibleTechs).map((tech) => (
                  <span
                    key={tech}
                    className={techPillClassName(project)}
                    style={techPillStyle(project)}
                  >
                    {tech}
                  </span>
                ))}
                {project.techs.length > maxVisibleTechs && (
                  <span
                    className={techPillClassName(project)}
                    style={techPillStyle(project)}
                  >
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

          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedId(null)}
          >
            <div
              className="portfolio-modal-scroll max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border p-6 pr-4 shadow-xl animate-in fade-in zoom-in-95 sm:pr-5"
              style={projectSurfaceStyle(selected)}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">{selected.title}</h3>
                </div>

                <button
                  onClick={() => setSelectedId(null)}
                  className={
                    selected.textColor
                      ? "rounded-md px-3 py-2 text-sm opacity-80 transition hover:opacity-100"
                      : "rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  }
                >
                  Close
                </button>
              </div>

              {selected.media.length > 0 && (
                <div className="mt-5 flex w-full flex-col items-center">
                  <div
                    className={`flex w-full items-center gap-3 ${selected.media.length > 1 ? "" : "justify-center"}`}
                  >
                    {selected.media.length > 1 && (
                      <button
                        type="button"
                        aria-label="Previous media"
                        className={
                          selected.textColor
                            ? "shrink-0 rounded-md border border-white/15 bg-black/20 p-2 opacity-80 transition hover:opacity-100"
                            : "shrink-0 rounded-md border bg-background p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          setMediaIndex((index) =>
                            (index - 1 + selected.media.length) % selected.media.length
                          );
                        }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                    <div
                      className={
                        selected.textColor
                          ? "flex min-h-[14rem] flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/20 sm:min-h-[17.5rem]"
                          : "flex min-h-[14rem] flex-1 items-center justify-center overflow-hidden rounded-xl border bg-muted/20 sm:min-h-[17.5rem]"
                      }
                    >
                      {renderMedia(
                        selected.media[mediaIndex],
                        "max-h-[min(50vh,22rem)] w-full max-w-full object-contain"
                      )}
                    </div>
                    {selected.media.length > 1 && (
                      <button
                        type="button"
                        aria-label="Next media"
                        className={
                          selected.textColor
                            ? "shrink-0 rounded-md border border-white/15 bg-black/20 p-2 opacity-80 transition hover:opacity-100"
                            : "shrink-0 rounded-md border bg-background p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          setMediaIndex((index) => (index + 1) % selected.media.length);
                        }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {selected.media.length > 1 && (
                    <p
                      className={
                        selected.textColor
                          ? "mt-2 text-center text-sm tabular-nums opacity-80"
                          : "mt-2 text-center text-sm tabular-nums text-muted-foreground"
                      }
                    >
                      {mediaIndex + 1} / {selected.media.length}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 space-y-5">
                {selected.descriptionSections.map((section) => (
                  <div key={`${selected.id}-${section.heading}`}>
                    <h4 className="portfolio-detail-title">{section.heading}</h4>
                    <div
                      className={`portfolio-detail-body mt-2 space-y-3 ${selected.textColor ? "opacity-80" : ""}`}
                    >
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
                        className={mutedLinkClassName(selected)}
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
                      <div
                        key={document.href}
                        className={
                          selected.textColor
                            ? "rounded-xl border border-white/10 bg-black/20 p-3"
                            : "rounded-xl border bg-muted/10 p-3"
                        }
                      >
                        <a
                          href={document.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={mutedLinkClassName(selected)}
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
                      className={techPillClassName(selected, "")}
                      style={techPillStyle(selected)}
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