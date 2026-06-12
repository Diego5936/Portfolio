import type { Project } from "@/data/projects/types";
import websiteVideo from "./media/website-video.mp4";

export const thetaTauWebsiteProject: Project = {
  id: "theta-tau-website",
  title: "Theta Tau Chapter Website",
  panelColor: "#83142C",
  accentColor: "#7e6322",
  textColor: "#fff3f3",
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
  links: [
    { label: "Live Site", href: "https://ucfthetatau.org" }
  ],
  media: [
    {src: websiteVideo, alt: "Theta Tau Website", kind: "video"}
  ],
};
