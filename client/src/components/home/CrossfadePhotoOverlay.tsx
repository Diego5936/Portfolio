import { useEffect, useRef, useState } from "react";

import type { GridPhoto } from "@/data/myPics";

type CrossfadePhotoOverlayProps = {
  photo: GridPhoto;
};

export function CrossfadePhotoOverlay({ photo }: CrossfadePhotoOverlayProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setOpacity(1);
      return;
    }

    setOpacity(0);

    const image = imageRef.current;
    if (!image) {
      return;
    }

    const startFade = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOpacity(1);
        });
      });
    };

    if (image.complete && image.naturalWidth > 0) {
      startFade();
      return;
    }

    image.addEventListener("load", startFade, { once: true });

    return () => {
      image.removeEventListener("load", startFade);
    };
  }, [photo.src]);

  return (
    <img
      ref={imageRef}
      src={photo.src}
      alt={photo.alt}
      className="portfolio-portrait-grid-photo portfolio-portrait-grid-photo--overlay"
      style={{ opacity }}
    />
  );
}
