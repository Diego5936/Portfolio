Project data is organized as one folder per project.

Structure:
- `<project-slug>/index.ts` holds text, links, and image metadata.
- `<project-slug>/images/` holds that project's image files.

Example usage in `index.ts`:

```ts
import coverImage from "./images/cover.jpg";
import detailImage from "./images/detail-1.jpg";

images: [
  { src: coverImage, alt: "Main project screenshot" },
  { src: detailImage, alt: "Feature detail screenshot" },
];
```
