import type { Project } from "@/data/projects/types";

export const strataProject: Project = {
  id: "strata",
  title: "Strata: Neuro-Evolution of Augmenting Topologies Implementation",
  descriptionSections: [
    {
      heading: "Overview",
      paragraphs: [
        "Implemented the NEAT algorithm from research in C# and Unity, applying variable-topology neural networks to simulated agents.",
        "Created Strata, where agents in diverse environments with identical rewards evolve different behavior patterns.",
        "Analyzed neural networks, learning patterns, and emergent behavior using Python and Matplotlib visualizations.",
      ],
    },
  ],
  techs: ["C#", "Unity", "NEAT", "Python", "Matplotlib"],
  links: [],
  media: [],
};
