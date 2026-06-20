import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type SlidingHoverTextProps = {
  text: string;
  className?: string;
};

export function SlidingHoverText({ text, className }: SlidingHoverTextProps) {
  const chars = text.split("");

  return (
    <span
      className={cn("nav-slide-text", className)}
      style={{ "--char-count": chars.length } as CSSProperties}
      aria-hidden="true"
    >
      {chars.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="nav-slide-char"
          style={{ "--char-index": index } as CSSProperties}
        >
          <span className="nav-slide-char-inner">
            <span className="nav-slide-char-line">{char === " " ? "\u00A0" : char}</span>
            <span className="nav-slide-char-line">{char === " " ? "\u00A0" : char}</span>
          </span>
        </span>
      ))}
    </span>
  );
}
