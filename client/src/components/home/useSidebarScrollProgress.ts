import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useSidebarScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const home = document.getElementById("home");
      const about = document.getElementById("about");
      if (!home || !about) {
        return;
      }

      const start = home.offsetTop + home.offsetHeight * 0.35;
      const end = about.offsetTop - 48;
      const raw = (window.scrollY - start) / Math.max(end - start, 1);

      setProgress(clamp(raw, 0, 1));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return progress;
}

const HEADER_HEIGHT_PX = 96;

function parseCssLengthPx(value: string, rootFontSize: number) {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  if (trimmed.endsWith("rem")) {
    return parseFloat(trimmed) * rootFontSize;
  }

  if (trimmed.endsWith("px")) {
    return parseFloat(trimmed);
  }

  return parseFloat(trimmed) || 0;
}

function readCssVarPx(element: HTMLElement, name: string, fallback: number) {
  const styles = getComputedStyle(element);
  const raw = styles.getPropertyValue(name).trim();
  if (!raw) {
    return fallback;
  }

  const rootFontSize = parseFloat(styles.fontSize) || 16;
  return parseCssLengthPx(raw, rootFontSize);
}

function readCssVarNumber(element: HTMLElement, name: string, fallback: number) {
  const raw = getComputedStyle(element).getPropertyValue(name).trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getDiegoInitialPanelSize(
  containerWidth: number,
  viewportMin: number,
  viewport: { width: number; height: number },
) {
  const vmin = Math.min(viewport.width, viewport.height);

  return Math.min(vmin * viewportMin, containerWidth);
}

export function usePortraitGridMorph(progress: number) {
  const morphRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [gridGapPx, setGridGapPx] = useState(10);
  const [scrolledMarginPx, setScrolledMarginPx] = useState(0);
  const [initialPanelViewportMin, setInitialPanelViewportMin] = useState(0.68);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const element = morphRef.current;
    if (!element) {
      return;
    }

    const measure = () => {
      const root = document.documentElement;

      setContainerWidth(element.clientWidth);
      setGridGapPx(readCssVarPx(root, "--portfolio-sidebar-grid-gap", 10));
      setScrolledMarginPx(
        readCssVarPx(root, "--portfolio-sidebar-grid-scrolled-margin-top", 0),
      );
      setInitialPanelViewportMin(
        readCssVarNumber(root, "--portfolio-diego-initial-panel-viewport-min", 0.68),
      );
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const width = containerWidth || viewport.width;
  const diegoInitialSize = getDiegoInitialPanelSize(
    width,
    initialPanelViewportMin,
    viewport,
  );
  const gridWidth = diegoInitialSize + Math.max(width - diegoInitialSize, 0) * progress;
  const gap = gridGapPx * progress;
  const cellSize = progress > 0 ? Math.max((gridWidth - gap) / 2, 0) : gridWidth;
  const leadTrack = progress > 0 ? cellSize : gridWidth;
  const trailTrack = progress > 0 ? cellSize : 0;

  const isDesktop = viewport.width >= 1024;
  const diegoIntroCenterPadding =
    isDesktop && progress < 1
      ? Math.max(0, (viewport.height - HEADER_HEIGHT_PX - diegoInitialSize) / 2) *
        (1 - progress)
      : 0;
  const scrolledPadding = scrolledMarginPx * progress;

  const minHeight =
    isDesktop && progress < 1
      ? (viewport.height - HEADER_HEIGHT_PX) * (1 - progress)
      : 0;

  return {
    morphRef,
    gridStyle: {
      width: `${gridWidth}px`,
      gridTemplateColumns: `${leadTrack}px ${trailTrack}px`,
      gridTemplateRows: `${leadTrack}px ${trailTrack}px`,
      gap: `${gap}px`,
    },
    morphStyle: {
      paddingTop: `${diegoIntroCenterPadding + scrolledPadding}px`,
      minHeight: `${minHeight}px`,
    } as CSSProperties,
    photoOpacity: progress,
  };
}
