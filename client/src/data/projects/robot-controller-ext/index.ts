import type { Project } from "@/data/projects/types";
import spotHouse from "./media/spot-house.gif";
import spotTargets from "./media/spot-targets.gif";

export const robotControllerExtProject: Project = {
  id: "robot-controller-ext",
  title: "Isaac Sim Robot Controller",
  descriptionSections: [
    {
      heading: "Overview",
      paragraphs: [
        "Robot Controller Extension is a lightweight Isaac Sim extension that exposes simulated robots through local HTTP REST APIs. It discovers supported robot prims in an active Isaac Sim stage, attaches runtime controllers when the simulation starts, and creates per-robot API services for motion control, pose and status queries, camera/IMU access, and task-level reset or target operations.",
        "The extension supports ground robot control, drone control, FastAPI-based local endpoints, one API service per discovered robot, task-level target/reset endpoints, and interactive Swagger documentation for each running service.",
      ],
    },
    {
      heading: "Purpose",
      paragraphs: [
        "This project was built to serve as a simple execution layer for external agents, scripts, notebooks, and LLM-based robotics experiments. Instead of requiring ROS, MCP, or a custom simulator loop, the extension gives external programs a direct HTTP interface for controlling robots inside Isaac Sim.",
        "I focused on making that interface practical: exposing robot control, sensing, and task utilities through clean local APIs so high-level autonomy systems could interact with simulated robots without being tightly coupled to Isaac Sim internals.",
      ],
    },
    {
      heading: "Learning",
      paragraphs: [
        "Building this extension sharpened my Isaac Sim skills by forcing me to understand extensions, stage structure, prim paths, runtime attachment, sensor access, and physics-step control at a much deeper level. It also gave me a stronger foundation for robotics research by connecting simulation infrastructure to real robot-control workflows in the lab.",
      ],
    },
  ],
  techs: [
    "Python",
    "NVIDIA Isaac Sim",
    "FastAPI",
    "REST APIs",
    "Omniverse Extensions",
    "USD / Stage Management",
    "Robot Control",
    "Simulation",
    "Sensor Integration",
    "Multi-Robot Systems",
    "Agentic Robotics",
  ],
  links: [
    { label: "Repository", href: "https://github.com/Robotics-LLM-Research/Robot_Controller_Ext" },
  ],
  media: [
    { src: spotHouse, alt: "Spot traversing house demo clip", kind: "gif" },
    { src: spotTargets, alt: "Spot autonomsly navigating to multiple targets", kind: "gif" },
  ],
};
