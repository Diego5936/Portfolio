import { useEffect } from "react";

import {
  useAboutGridPhotoSet,
  usePhotoSetCrossfade,
} from "@/components/home/usePhotoSetCrossfade";
import { DiffusionPanel } from "@/components/home/DiffusionPanel";
import { PortraitGridPhotoCell } from "@/components/home/PortraitGridPhotoCell";
import {
  usePortraitGridMorph,
  useSidebarScrollProgress,
} from "@/components/home/useSidebarScrollProgress";
import { preloadGridPhotos } from "@/data/myPics";

const GRID_PHOTO_SLOT_COUNT = 3;

export function PortraitSidebar() {
  const progress = useSidebarScrollProgress();
  const activePhotoSet = useAboutGridPhotoSet();
  const { committedSet, incomingSet } = usePhotoSetCrossfade(activePhotoSet);
  const { morphRef, gridStyle, morphStyle, photoOpacity } =
    usePortraitGridMorph(progress);

  useEffect(() => {
    preloadGridPhotos();
  }, []);

  return (
    <div
      ref={morphRef}
      className="portfolio-portrait-morph"
      style={morphStyle}
    >
      <div className="portfolio-portrait-grid" style={gridStyle}>
        <div className="portfolio-portrait-grid-cell portfolio-portrait-grid-cell--diffusion">
          <DiffusionPanel />
        </div>
        {Array.from({ length: GRID_PHOTO_SLOT_COUNT }, (_, slotIndex) => (
          <PortraitGridPhotoCell
            key={slotIndex}
            slotIndex={slotIndex}
            committedSet={committedSet}
            incomingSet={incomingSet}
            photoOpacity={photoOpacity}
          />
        ))}
      </div>
    </div>
  );
}
