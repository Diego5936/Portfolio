import type { ExperienceItem } from "@/data/experience/types";
import pheratechPoster from "@/data/experience/pheratech-systems/media/pheratech-poster.mp4";
import pheratechSystemsLogo from "@/data/experience/pheratech-systems/media/pheratech_logo.jpg";

export const pheratechSystemsExperience: ExperienceItem = {
  organization: "Pheratech Systems",
  role: "Neural Systems Intern",
  dateEnd: "May 2025",
  dateStart: "January 2025",
  posterSrc: pheratechPoster,
  posterAlt: "Pheratech Systems poster",
  posterKind: "video",
  logoSrc: pheratechSystemsLogo,
  logoAlt: "Pheratech Systems logo",
  highlights: [
    "At Pheratech Systems, I helped develop next-generation robotic vehicles powered by swarm logic and decentralized AI. My work was centered on building Unity-based simulations that showcased real-world performance and gave stakeholders a clear view of how our systems made autonomous decisions. I began to integrate reinforcement learning models (such as PPO) into a Unity-Python framework to create adaptability and efficiency in dynamic environments. I also contributed to early efforts on a custom LLM designed to streamline how our platforms interpret complex data and improve mission-level decision-making.",
  ],
};
