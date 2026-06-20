import { useLayoutEffect, useRef, useState } from "react";

const pillClassName = "project-tech-pill shrink-0 rounded-full px-2.5 py-1 text-xs";

type ProjectCardTechsProps = {
  techs: string[];
};

function calculateVisibleCount(
  containerWidth: number,
  pillWidths: number[],
  gap: number,
  overflowWidth: number
) {
  let used = 0;
  let count = 0;

  for (let index = 0; index < pillWidths.length; index++) {
    const gapBefore = count > 0 ? gap : 0;
    const remainingAfter = pillWidths.length - (index + 1);
    const reserve = remainingAfter > 0 ? gap + overflowWidth : 0;

    if (used + gapBefore + pillWidths[index] + reserve <= containerWidth) {
      used += gapBefore + pillWidths[index];
      count++;
    } else {
      break;
    }
  }

  return count;
}

export function ProjectCardTechs({ techs }: ProjectCardTechsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(techs.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure || techs.length === 0) return;

    const updateVisibleCount = () => {
      const containerWidth = container.clientWidth;
      const measurePills = Array.from(measure.children) as HTMLElement[];
      const techPills = measurePills.slice(0, techs.length);
      const overflowPill = measurePills[techs.length];

      if (containerWidth === 0 || techPills.length === 0) return;

      const gap = Number.parseFloat(getComputedStyle(container).columnGap || "0") || 0;
      const pillWidths = techPills.map((pill) => pill.offsetWidth);
      const overflowWidth = overflowPill?.offsetWidth ?? 0;

      setVisibleCount(
        calculateVisibleCount(containerWidth, pillWidths, gap, overflowWidth)
      );
    };

    updateVisibleCount();

    const resizeObserver = new ResizeObserver(updateVisibleCount);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [techs]);

  if (techs.length === 0) return null;

  const hiddenCount = techs.length - visibleCount;

  return (
    <div className="project-card-techs-wrap">
      <div ref={measureRef} className="project-card-techs-measure" aria-hidden="true">
        {techs.map((tech) => (
          <span key={tech} className={pillClassName}>
            {tech}
          </span>
        ))}
        <span className={pillClassName}>+{techs.length}</span>
      </div>

      <div ref={containerRef} className="project-card-techs">
        {techs.slice(0, visibleCount).map((tech) => (
          <span key={tech} className={pillClassName}>
            {tech}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className={pillClassName}>+{hiddenCount}</span>
        )}
      </div>
    </div>
  );
}
