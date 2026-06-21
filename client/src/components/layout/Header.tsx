import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Github, Linkedin, FileText } from "lucide-react";

import { SlidingHoverText } from "@/components/ui/SlidingHoverText";
import { cn } from "@/lib/utils";

const nav = [
  { label: "HOME", href: "/" },
  { label: "PROJECTS", href: "/projects" },
  { label: "EXPERIENCE", href: "/experience" },
  { label: "SKILLS", href: "/#skills" },
] as const;

type PillMetrics = {
  left: number;
  width: number;
  opacity: number;
};

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function trailProgress(progress: number, delay: number) {
  if (progress <= delay) {
    return 0;
  }

  return easeOutCubic((progress - delay) / (1 - delay));
}

function readNavLocation() {
  return `${window.location.pathname}${window.location.hash}`;
}

function isNavItemActive(href: string) {
  const url = new URL(href, window.location.origin);

  if (url.hash) {
    return window.location.pathname === url.pathname && window.location.hash === url.hash;
  }

  if (url.pathname === "/") {
    return window.location.pathname === "/" && window.location.hash !== "#skills";
  }

  return window.location.pathname === url.pathname;
}

function parseCssLength(value: string, rootFontSize: number) {
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

  return parseFloat(trimmed);
}

function parseCssNumber(value: string, fallback: number) {
  const parsed = parseFloat(value.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (!section) {
    return false;
  }

  section.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.pushState(null, "", `#${id}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
  return true;
}

function navigateTo(href: string) {
  const url = new URL(href, window.location.origin);
  const nextUrl = `${url.pathname}${url.hash}`;

  if (`${window.location.pathname}${window.location.hash}` === nextUrl) {
    return;
  }

  window.history.pushState(null, "", nextUrl);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function replaceHash(hash: "" | "#skills") {
  const nextUrl = `${window.location.pathname}${hash}`;
  const currentUrl = `${window.location.pathname}${window.location.hash}`;
  if (nextUrl === currentUrl) {
    return;
  }

  window.history.replaceState(null, "", nextUrl);
}

function handleNavClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string,
) {
  const url = new URL(href, window.location.origin);
  const sectionId = url.hash.replace("#", "");

  event.preventDefault();

  if (sectionId) {
    if (window.location.pathname !== url.pathname) {
      navigateTo(`${url.pathname}#${sectionId}`);
      return;
    }

    scrollToSection(sectionId);
    return;
  }

  navigateTo(url.pathname);

  if (!url.hash && (url.pathname === "/" || url.pathname === "/projects")) {
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}

function handleNavSlideEnter(event: React.MouseEvent<HTMLAnchorElement>) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const fromRight = event.clientX - rect.left > rect.width / 2;

  target.dataset.slideDirection = fromRight ? "rtl" : "ltr";
  target.classList.add("nav-slide-active");
}

function handleNavSlideLeave(event: React.MouseEvent<HTMLAnchorElement>) {
  event.currentTarget.classList.remove("nav-slide-active");
}

function handleNavSlideFocus(event: React.FocusEvent<HTMLAnchorElement>) {
  event.currentTarget.dataset.slideDirection = "ltr";
  event.currentTarget.classList.add("nav-slide-active");
}

function handleNavSlideBlur(event: React.FocusEvent<HTMLAnchorElement>) {
  event.currentTarget.classList.remove("nav-slide-active");
}

export function Header() {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const pillFrameRef = useRef<number | undefined>(undefined);
  const pillStateRef = useRef({ left: 0, width: 0, opacity: 0 });
  const previousActiveHrefRef = useRef<string | undefined>(undefined);
  const [navLocation, setNavLocation] = useState(readNavLocation);
  const [pillReady, setPillReady] = useState(false);
  const [pillStyle, setPillStyle] = useState<PillMetrics>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const activeHref = nav.find((item) => isNavItemActive(item.href))?.href;

  const getPillTarget = useCallback(() => {
    const navEl = navRef.current;
    const activeEl = activeHref ? linkRefs.current.get(activeHref) : null;

    if (!navEl || !activeEl) {
      return null;
    }

    const navRect = navEl.getBoundingClientRect();
    const linkRect = activeEl.getBoundingClientRect();
    const navStyles = getComputedStyle(navEl);
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const pillMinWidth = parseCssLength(
      navStyles.getPropertyValue("--portfolio-header-nav-active-pill-width"),
      rootFontSize,
    );

    const width = Math.max(linkRect.width, pillMinWidth);
    const linkCenter = linkRect.left - navRect.left + linkRect.width / 2;

    return {
      left: linkCenter - width / 2,
      width,
      opacity: 1,
    };
  }, [activeHref]);

  const animatePillTo = useCallback(
    (target: { left: number; width: number; opacity: number }, animate: boolean) => {
      if (pillFrameRef.current) {
        cancelAnimationFrame(pillFrameRef.current);
      }

      const settle = (left: number, width: number, opacity: number) => {
        pillStateRef.current = { left, width, opacity };
        setPillStyle({ left, width, opacity });
      };

      if (!animate) {
        settle(target.left, target.width, target.opacity);
        return;
      }

      const navEl = navRef.current;
      const navStyles = navEl ? getComputedStyle(navEl) : null;
      const duration = parseCssNumber(
        navStyles?.getPropertyValue("--portfolio-header-nav-pill-duration") ?? "",
        420,
      );
      const trailDelay = parseCssNumber(
        navStyles?.getPropertyValue("--portfolio-header-nav-pill-trail-delay") ?? "",
        0.22,
      );

      const fromLeft = pillStateRef.current.left;
      const fromWidth = pillStateRef.current.width;
      const fromRight = fromLeft + fromWidth;
      const targetRight = target.left + target.width;
      const fromCenter = fromLeft + fromWidth / 2;
      const targetCenter = target.left + target.width / 2;
      const movingRight = targetCenter >= fromCenter;
      const startTime = performance.now();

      const tick = (now: number) => {
        const rawProgress = Math.min((now - startTime) / duration, 1);
        const leadProgress = easeOutCubic(rawProgress);
        const lagProgress = trailProgress(rawProgress, trailDelay);

        let left: number;
        let right: number;

        if (movingRight) {
          right = fromRight + (targetRight - fromRight) * leadProgress;
          left = fromLeft + (target.left - fromLeft) * lagProgress;
        } else {
          left = fromLeft + (target.left - fromLeft) * leadProgress;
          right = fromRight + (targetRight - fromRight) * lagProgress;
        }

        const width = Math.max(right - left, 0);

        pillStateRef.current = { left, width, opacity: target.opacity };
        setPillStyle({ left, width, opacity: target.opacity });

        if (rawProgress < 1) {
          pillFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        settle(target.left, target.width, target.opacity);
      };

      pillFrameRef.current = requestAnimationFrame(tick);
    },
    [],
  );

  useEffect(() => {
    const syncNavLocation = () => setNavLocation(readNavLocation());

    window.addEventListener("hashchange", syncNavLocation);
    window.addEventListener("popstate", syncNavLocation);

    return () => {
      window.removeEventListener("hashchange", syncNavLocation);
      window.removeEventListener("popstate", syncNavLocation);
    };
  }, []);

  useEffect(() => {
    let frame: number | null = null;

    const syncHomeSkillsHashOnScroll = () => {
      frame = null;

      if (window.location.pathname !== "/") {
        return;
      }

      const skillsSection = document.getElementById("skills");
      if (!skillsSection) {
        return;
      }

      const navStyles = navRef.current ? getComputedStyle(navRef.current) : null;
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const headerHeight = parseCssLength(
        navStyles?.getPropertyValue("--portfolio-header-height") ?? "",
        rootFontSize,
      );
      const switchLine = headerHeight + 24;
      const nearTop = window.scrollY <= 12;
      const skillsReached = skillsSection.getBoundingClientRect().top <= switchLine;

      const nextHash: "" | "#skills" = !nearTop && skillsReached ? "#skills" : "";
      if (nextHash !== window.location.hash) {
        replaceHash(nextHash);
        setNavLocation(readNavLocation());
      }
    };

    const onScroll = () => {
      if (frame !== null) {
        return;
      }

      frame = window.requestAnimationFrame(syncHomeSkillsHashOnScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const target = getPillTarget();

    if (!target) {
      animatePillTo({ left: 0, width: 0, opacity: 0 }, false);
      previousActiveHrefRef.current = activeHref;
      return;
    }

    const shouldAnimate =
      pillReady &&
      previousActiveHrefRef.current !== undefined &&
      previousActiveHrefRef.current !== activeHref;

    animatePillTo(target, shouldAnimate);
    previousActiveHrefRef.current = activeHref;
  }, [activeHref, animatePillTo, getPillTarget, navLocation, pillReady]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => setPillReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const target = getPillTarget();
      if (target) {
        animatePillTo(target, false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [animatePillTo, getPillTarget]);

  useEffect(
    () => () => {
      if (pillFrameRef.current) {
        cancelAnimationFrame(pillFrameRef.current);
      }
    },
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur">
      <div className="portfolio-header-bar mx-auto flex h-[var(--portfolio-header-height)] max-w-[min(100%,85rem)] items-center justify-between px-3 sm:px-4 lg:px-5">
        <div className="portfolio-header-brand-nav flex min-w-0 items-center">
          <a
            href="/"
            onClick={(event) => handleNavClick(event, "/")}
            className="portfolio-header-logo shrink-0 font-semibold tracking-tight"
          >
            <img
              src="/icon.png"
              alt=""
              className="portfolio-header-logo-icon"
              width={36}
              height={36}
            />
            dpedroza
            <span className="text-muted-foreground">.dev</span>
          </a>

          <nav ref={navRef} className="portfolio-header-nav hidden items-center sm:flex">
            <span
              aria-hidden="true"
              className={cn("nav-active-pill", pillReady && "nav-active-pill-ready")}
              style={{
                width: pillStyle.width,
                opacity: pillStyle.opacity,
                transform: `translateX(${pillStyle.left}px)`,
              }}
            />

            {nav.map((item) => {
              const isActive = item.href === activeHref;

              return (
                <a
                  key={item.href}
                  ref={(node) => {
                    if (node) {
                      linkRefs.current.set(item.href, node);
                      return;
                    }

                    linkRefs.current.delete(item.href);
                  }}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => handleNavClick(event, item.href)}
                  onMouseEnter={handleNavSlideEnter}
                  onMouseLeave={handleNavSlideLeave}
                  onFocus={handleNavSlideFocus}
                  onBlur={handleNavSlideBlur}
                  className={cn(
                    "nav-slide-link text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "nav-slide-link-active",
                  )}
                >
                  <span className="sr-only">{item.label}</span>
                  <SlidingHoverText text={item.label} />
                </a>
              );
            })}
          </nav>
        </div>

        <div className="portfolio-header-icons flex items-center">
          <a
            href="https://github.com/Diego5936"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-muted-foreground transition hover:text-foreground"
          >
            <Github className="portfolio-header-icon" />
          </a>

          <a
            href="https://linkedin.com/in/diegopedrozap/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-muted-foreground transition hover:text-foreground"
          >
            <Linkedin className="portfolio-header-icon" />
          </a>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-muted-foreground transition hover:text-foreground"
          >
            <FileText className="portfolio-header-icon" />
          </a>
        </div>
      </div>
    </header>
  );
}
