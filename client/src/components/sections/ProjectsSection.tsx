import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Github, Globe, Video, X } from "lucide-react";
import { projects } from "@/data/projects";
import { ProjectCardTechs } from "@/components/sections/ProjectCardTechs";
import type { ProjectMedia } from "@/data/projects/types";
import type { LucideIcon } from "lucide-react";

function getProjectLinkIcon(label: string, href: string): LucideIcon | null {
  const normalizedLabel = label.toLowerCase();
  const normalizedHref = href.toLowerCase();

  if (
    normalizedLabel.includes("repository") ||
    normalizedLabel.includes("github") ||
    normalizedHref.includes("github.com")
  ) {
    return Github;
  }

  if (
    normalizedLabel.includes("video") ||
    normalizedLabel.includes("youtube") ||
    normalizedHref.includes("youtube.com") ||
    normalizedHref.includes("youtu.be")
  ) {
    return Video;
  }

  if (normalizedLabel.includes("devpost") || normalizedHref.includes("devpost.com")) {
    return ExternalLink;
  }

  if (
    normalizedLabel.includes("live site") ||
    normalizedLabel.includes("live demo") ||
    normalizedLabel.includes("website") ||
    normalizedLabel.includes("live")
  ) {
    return Globe;
  }

  return null;
}

export function ProjectsSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const selected = projects.find((project) => project.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    setMediaIndex(0);
    modalRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);
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

    if (media.kind === "gif") {
      return <img src={media.src} alt={media.alt} className={className} />;
    }

    return <img src={media.src} alt={media.alt} className={className} loading="lazy" />;
  };

  const shouldShowDualPreview = (project: (typeof projects)[number]) =>
    project.media.length > 1 && project.media[0].isSquare && project.media[1].isSquare;

  return (
    <section id="projects" className="projects-section pt-6 sm:pt-8">
      <h2 className="mb-10 text-center text-4xl font-semibold tracking-tight sm:text-5xl">
        Projects
      </h2>

      <div className="projects-grid">
        {projects.map((project) => (
          <button
            key={project.id}
            data-project={project.id}
            onClick={() => setSelectedId(project.id)}
            className="project-card group h-full focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="project-card-panel project-card-title-panel">
              <h3 className="project-card-title">{project.title}</h3>
            </div>

            <div className="project-card-panel project-card-content-panel">
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
                  <p className="project-card-preview text-sm">
                    {getProjectPreview(project)}
                  </p>
                )}

                <ProjectCardTechs techs={project.techs} />

                <div className="project-card-details-link">
                  <span>View Details</span>
                  <span className="project-card-details-arrow-track" aria-hidden="true">
                    <ChevronRight className="project-card-details-icon" />
                  </span>
                </div>
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
              ref={modalRef}
              data-project={selected.id}
              className="portfolio-modal-scroll max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border p-6 pr-4 shadow-xl animate-in fade-in zoom-in-95 sm:pr-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="project-modal-header">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="project-modal-title">{selected.title}</h3>

                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Close"
                    className="project-modal-close shrink-0 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selected.links.length > 0 && (
                  <div className="project-modal-action-bar">
                    {selected.links.map((link) => {
                      const LinkIcon = getProjectLinkIcon(link.label, link.href);

                      return (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-action-link"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {LinkIcon && (
                          <LinkIcon className="project-action-link-icon" aria-hidden="true" />
                        )}
                        {link.label}
                      </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {selected.media.length > 0 && (
                <div className="project-media-showcase mt-5">
                  <div className="project-media-frame">
                    {selected.media.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous media"
                          className="project-media-nav project-media-nav-prev"
                          onClick={(event) => {
                            event.stopPropagation();
                            setMediaIndex((index) =>
                              (index - 1 + selected.media.length) % selected.media.length
                            );
                          }}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next media"
                          className="project-media-nav project-media-nav-next"
                          onClick={(event) => {
                            event.stopPropagation();
                            setMediaIndex((index) => (index + 1) % selected.media.length);
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}

                    <div className="project-media-stage">
                      {renderMedia(selected.media[mediaIndex], "project-media-item")}
                    </div>
                  </div>

                  {selected.media.length > 1 && (
                    <div className="project-media-dots" role="tablist" aria-label="Project media">
                      {selected.media.map((media, index) => (
                        <button
                          key={media.src}
                          type="button"
                          role="tab"
                          aria-label={`Show media ${index + 1} of ${selected.media.length}`}
                          aria-selected={index === mediaIndex}
                          className={
                            index === mediaIndex
                              ? "project-media-dot is-active"
                              : "project-media-dot"
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            setMediaIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  )}
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

              {selected.documents && selected.documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xl font-semibold tracking-tight">Documents</h4>
                  <div className="mt-3 space-y-4">
                    {selected.documents.map((document) => (
                      <div
                        key={document.href}
                        className="project-document-panel rounded-xl border p-3"
                      >
                        <a
                          href={document.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-muted-link transition hover:text-foreground"
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
                      className="project-tech-pill shrink-0 rounded-full px-2.5 py-1 text-xs"
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
