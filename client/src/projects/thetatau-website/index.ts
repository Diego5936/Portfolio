import type { Project } from "@/projects/types";

export const thetaTauWebsiteProject: Project = {
  id: "theta-tau-website",
  title: "Theta Tau Chapter Website",
  descriptionSections: [
    {
      heading: "Overview",
      paragraphs: [
        "Architected and built a PERN-stack web application deployed on a Linux (Ubuntu) AWS LightSail server.",
        "Designed a public-facing experience for students to learn about chapter recruitment and philanthropy.",
        "Secured the site with a whitelist-only login system for brothers to access exclusive resources and features.",
      ],
    },
  ],
  techs: ["PostgreSQL", "Express", "React", "Node.js", "Linux", "AWS LightSail"],
  links: [{ label: "Live Site", href: "https://ucfthetatau.org" }],
  media: [],
};
