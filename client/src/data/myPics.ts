import pic1 from "@/assets/my-pics/pic1.jpeg";
import pic2 from "@/assets/my-pics/pic2.jpg";
import pic3 from "@/assets/my-pics/pic3.jpg";
import pic4 from "@/assets/my-pics/pic4.jpeg";
import pic5 from "@/assets/my-pics/pic5.jpeg";
import pic6 from "@/assets/my-pics/pic6.jpg";
import pic7 from "@/assets/my-pics/pic7.jpeg";
import pic8 from "@/assets/my-pics/pic8.png";
import pic9 from "@/assets/my-pics/pic9.jpg";
import picPortrait from "@/assets/my-pics/pic-portrait.jpeg";

export { picPortrait };

const gridSlots = [
  { gridColumn: 2, gridRow: 1 },
  { gridColumn: 1, gridRow: 2 },
  { gridColumn: 2, gridRow: 2 },
] as const;

const gridPhotoSources = [
  [pic1, pic2, pic3],
  [pic4, pic5, pic6],
  [pic7, pic8, pic9],
] as const;

export const gridPhotoSets = gridPhotoSources.map((sources, setIndex) =>
  sources.map((src, slotIndex) => {
    const photoNumber = setIndex * 3 + slotIndex + 1;

    return {
      id: `pic${photoNumber}`,
      src,
      alt: `Diego photo ${photoNumber}`,
      gridColumn: gridSlots[slotIndex].gridColumn,
      gridRow: gridSlots[slotIndex].gridRow,
    };
  }),
);

export type GridPhoto = (typeof gridPhotoSets)[number][number];

export function getGridPhotos(setIndex: number): GridPhoto[] {
  return gridPhotoSets[setIndex] ?? gridPhotoSets[0];
}

export function preloadGridPhotos() {
  for (const photoSet of gridPhotoSets) {
    for (const photo of photoSet) {
      const image = new Image();
      image.src = photo.src;
    }
  }
}
