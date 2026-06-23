import type { Project } from "@/data/projects/types";
import websiteVideo from "./media/website-video.mp4";

export const thetaTauWebsiteProject: Project = {
  id: "theta-tau-website",
  title: "Theta Tau Chapter Website",
  descriptionSections: [
    {
      heading: "Overview",
      paragraphs: [
        "Theta Tau UCF is a PERN-stack web application built to serve both as the public website for our engineering fraternity and as the foundation for our internal member platform. The public-facing side gives students a clean way to learn about chapter recruitment, philanthropy, events, and our organization’s presence at UCF.",
        "The application was deployed on a Linux Ubuntu AWS LightSail server and secured with a whitelist-only login system so brothers could access exclusive resources and internal tools.",
      ],
    },
    {
      heading: "Developers Committee",
      paragraphs: [
        "When I first joined Theta Tau, our chapter had multiple disconnected websites and tools that had been created over the years, but many of them were deprecated, undocumented, or difficult to maintain after members graduated. At the same time, I was building a separate tool myself and realized we needed a more reliable server and a more unified technical structure.",
        "That led me to found the Developers Committee, a team focused on improving the systems and workflows that members found tedious or inefficient. Our first major goal was to rebuild the website from the ground up with scalability, maintainability, and security in mind. From there, the project grew into a platform where members and boards could request tools, dashboards, automations, and internal resources.",
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
