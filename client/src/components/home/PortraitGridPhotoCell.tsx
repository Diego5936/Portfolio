import type { CSSProperties } from "react";

import { CrossfadePhotoOverlay } from "@/components/home/CrossfadePhotoOverlay";
import { getGridPhotos, type GridPhoto } from "@/data/myPics";

type PortraitGridPhotoCellProps = {
  slotIndex: number;
  committedSet: number;
  incomingSet: number | null;
  photoOpacity: number;
};

function getSlotPhoto(setIndex: number, slotIndex: number): GridPhoto {
  return getGridPhotos(setIndex)[slotIndex];
}

export function PortraitGridPhotoCell({
  slotIndex,
  committedSet,
  incomingSet,
  photoOpacity,
}: PortraitGridPhotoCellProps) {
  const basePhoto = getSlotPhoto(committedSet, slotIndex);
  const overlayPhoto =
    incomingSet === null ? null : getSlotPhoto(incomingSet, slotIndex);

  return (
    <div
      className="portfolio-portrait-grid-cell portfolio-portrait-grid-cell--photo"
      style={
        {
          "--photo-opacity": photoOpacity,
          gridColumn: basePhoto.gridColumn,
          gridRow: basePhoto.gridRow,
        } as CSSProperties
      }
    >
      <div className="portfolio-portrait-grid-photo-stack">
        <img
          src={basePhoto.src}
          alt={overlayPhoto ? "" : basePhoto.alt}
          aria-hidden={overlayPhoto ? true : undefined}
          className="portfolio-portrait-grid-photo portfolio-portrait-grid-photo--base"
        />
        {overlayPhoto ? (
          <CrossfadePhotoOverlay
            key={`${incomingSet}-${slotIndex}`}
            photo={overlayPhoto}
          />
        ) : null}
      </div>
    </div>
  );
}
