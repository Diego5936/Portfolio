import type { Project } from "@/projects/types";
import hotdogImage from "./media/hotdog.jpg";
import hotdogVideo from "./media/Thumbnail.mp4";
import hotdogFinalReport from "./media/final_report.pdf";

export const hotdogProject: Project = {
  id: "hotdog",
  title: "HotDog - Multi-Agent LLM-Controlled JetBot",
  descriptionSections: [
    {
      heading: "Origin",
      paragraphs: [
        "HotDog began as our final project for Intro to Robotics. Since our group was entirely made up of computer science majors, we knew we wanted to build something that leaned heavily into software and AI.",
        "We wanted to apply paradigms and theory we learned in class, so we created HotDog: an open-ended, LLM-driven autonomous robot that interprets natural-language goals and turns them into action.",
      ],
    },
    {
      heading: "Details",
      paragraphs: [
        "Built on the NVIDIA Jetson Orin Nano and JetBot platform, HotDog integrates motor control, ultrasonic distance sensing, and real-time computer vision for autonomous navigation and interaction.",
        "The robot uses a multi-agent PLAN / SENSE / ACT architecture where Director, Observer, and Pilot agents communicate through shared global state to translate natural-language goals into executable behavior.",
        "YOLOE powers real-time object detection with dynamic, user-controlled label filtering, while a FastAPI + WebSocket backend streams annotated vision and telemetry to a React/Next.js + Tailwind frontend for monitoring, control, and goal issuing.",
        "What makes HotDog interesting is generalized, agentic autonomy. Instead of hard-coded routines, the system uses LLM reasoning to decide what matters in the environment and how to act next.",
      ],
    },
    {
      heading: "Memorable Experiment",
      paragraphs: [
        "One of the most interesting tests asked HotDog to look for an unconscious friend. The robot identified a YOLOE person detection, reasoned over the box geometry, and inferred that a wider-than-tall person likely meant someone was lying down.",
        "We built HotDog to explore VLA-style open-ended reasoning in robotics, and that experiment validated the level of generalization we were aiming for.",
      ],
    },
  ],
  techs: ["FastAPI", "WebSocket", "React", "Next.js", "Tailwind", "YOLOE", "Jetson"],
  links: [
    { label: "Repository", href: "https://github.com/ENG4060-C/final-project" },
    { label: "Video Demo", href: "https://youtu.be/sI2yJACUfRg" },
  ],
  documents: [{ label: "Final Report (PDF)", href: hotdogFinalReport, kind: "pdf" }],
  media: [
    {
      src: hotdogVideo,
      alt: "HotDog JetBot demo clip",
      kind: "video",
      poster: hotdogImage,
    },
    {
      src: hotdogImage,
      alt: "HotDog JetBot Robot",
      kind: "image",
    },
  ],
};
