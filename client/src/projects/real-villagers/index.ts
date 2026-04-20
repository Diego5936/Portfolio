import type { Project } from "@/projects/types";

export const realVillagersProject: Project = {
  id: "real-villagers",
  title: "Real Villagers: Multi-Agent Reinforcement Learning in Minecraft",
  descriptionSections: [
    {
      heading: "Overview",
      paragraphs: [
        "Applied a MARL PPO algorithm in Java to drive intelligent villager behavior in Minecraft.",
        "Built a framework for intra-agent dynamics and non-agent entities to simulate a living game-world community.",
        "Added interactive systems for collaboration and dynamics between AI-driven villagers and human players.",
      ],
    },
  ],
  techs: ["Java", "MARL", "PPO", "Minecraft AI"],
  links: [],
  media: [],
};
