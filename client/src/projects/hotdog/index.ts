import type { Project } from "@/projects/types";
import hotdogImage from "./images/hotdog.jpg";

export const hotdogProject: Project = {
  id: "hotdog",
  title: "HotDog - Multi-Agent LLM-Controlled JetBot",
  highlights: [
    "Collaborated with a team to build an autonomous robot on the NVIDIA Jetson Orin Nano and JetBot platform with motor control, ultrasonic sensors, and camera integration.",
    "Established a multi-agent LLM command layer (Director / Observer / Pilot) so vague natural-language goals could become actionable objectives and label sets.",
    "Implemented a FastAPI + WebSocket backend to stream YOLOE detections and telemetry to a React/Next.js + Tailwind frontend for real-time control and monitoring.",
  ],
  techs: ["FastAPI", "WebSocket", "React", "Next.js", "Tailwind", "YOLOE", "Jetson"],
  links: [],
  images: [
    {
      src: hotdogImage,
      alt: "HotDog JetBot Robot",
    },
  ],
};
