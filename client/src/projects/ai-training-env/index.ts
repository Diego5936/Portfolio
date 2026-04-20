import type { Project } from "@/projects/types";

export const aiTrainingEnvProject: Project = {
  id: "ai-training-env",
  title: "AI Training Environment",
  descriptionSections: [
    {
      heading: "Overview",
      paragraphs: [
        "Developed an arcade in C# where humans compete against AI in classic games such as Snake and Connect 4.",
        "Added multiple AI levels so players can choose opponents based on training duration.",
        "Designed a user-friendly interface for seamless AI difficulty selection.",
      ],
    },
  ],
  techs: ["C#", "Game AI", "UI Design"],
  links: [],
  media: [],
};
