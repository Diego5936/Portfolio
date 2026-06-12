import type { Project } from "@/data/projects/types";
import stackupVideo from "@/data/projects/garmin-arcade/media/stackup-video.mp4";
import snakeImage from "@/data/projects/garmin-arcade/media/sc_img-snake.png";
import game2048Image from "@/data/projects/garmin-arcade/media/sc_img-2048.png";

export const garminArcadeProject: Project = {
  id: "garmin-arcade-gallery",
  title: "Garmin Arcade Gallery",
  panelColor: "#000000",
  accentColor: "#6848b0",
  textColor: "#f4eeff",
  descriptionSections: [
    {
      heading: "🎮 ArcadeX for Garmin Smartwatches",
      paragraphs: [
        "ArcadeX is a modular mini-game collection for Garmin smartwatches built with Monkey C and the Garmin Connect IQ SDK, designed for quick, fun sessions right on your wrist—no phone required. It’s perfect for cooldowns after a run, a short break, or just winding down.",
        "Engineered for responsiveness across device models, ArcadeX uses low-latency input handling, custom renderers, and lightweight UI layouts to keep gameplay smooth and battery-friendly. Performance is optimized through efficient rendering, consistent frame pacing, and power-conscious execution.",
      ],
    },
    {
      heading: "🕹️ Currently Available Games",
      paragraphs: [
        "🧩 2048 – Combine matching numbers to reach higher scores.",
        "🐍 Snake – Guide your snake and collect food while avoiding collisions.",
        "🧱 StackUp – A classic-style block stacking challenge.",
      ],
    },
    {
      heading: "🚀 Coming Soon",
      paragraphs: [
        "QuickDash – A fast-paced obstacle game inspired by endless runners.",
        "MiniMaze – Navigate simple mazes with touch controls.",
        "Breakout – Destroy tiles and test your reflexes.",
        "Catch It! – Slide to catch falling items in time.",
      ],
    },
  ],
  techs: [
    "Monkey C",
    "Garmin Connect IQ SDK",
    "Connect IQ Simulator",
    "Wearable UI/UX design",
    "Touch + hardware button input handling",
    "2D game logic development",
    "Performance optimization for constrained devices",
    "Cross-device compatibility",
  ],
  links: [
    {
      label: "Repository",
      href: "https://github.com/Diego5936/ArcadeX",
    },
  ],
  media: [
    {
      src: stackupVideo,
      alt: "StackUp gameplay video",
      kind: "video",
      isSquare: true,
    },
    {
      src: snakeImage,
      alt: "Snake gameplay screenshot",
      kind: "image",
      isSquare: true,
    },
    {
      src: game2048Image,
      alt: "2048 gameplay screenshot",
      kind: "image",
      isSquare: true,
    },
  ],
};
