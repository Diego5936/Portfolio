Project data is organized as one folder per project.

Structure:
- `<project-slug>/index.ts` holds text, links, and media metadata.
- `<project-slug>/media/` holds that project's image/video files.

Example usage in `index.ts`:

```ts
import coverImage from "./media/cover.jpg";
import demoClip from "./media/demo.mp4";

media: [
  { src: demoClip, alt: "Main project demo clip", kind: "video", poster: coverImage },
  { src: coverImage, alt: "Main project screenshot", kind: "image" },
];
```
