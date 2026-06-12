import type { Project } from "@/data/projects/types";
import phoneVideo from "./media/app-video.mp4";
import blueprint from "./media/layer-adjustment-step.png";
import fdd from "./media/Final Design Document.pdf";

export const polarisProject: Project = {
  id: "polaris",
  title: "Polaris",
  panelColor: "#1364b0",
  accentColor: "#12765c",
  textColor: "#e7eefb",
  descriptionSections: [
    {
      heading: "Overview",
      paragraphs: [
        "Polaris is a deployed iOS indoor navigation application focused on accessibility. It helps people with various accessible needs navigate in complex indoor spaces. Its purpose is to make indoor navigation feel as seamless and intuitive as outdoor navigation, especially for users who may face mobility, visual, or other accessibility-related challenges. Instead of treating accessibility as an extra feature, Polaris is built around the idea that navigation should be usable and dependable for everyone.",
      ],
    },
    {
      heading: "Motivation",
      paragraphs: [
        "Polaris was my team’s Senior Design project, and it was my number one choice from the start. I was interested in it because it was a real deployed product with an existing foundation and clear impact. That made the work feel meaningful right away. It also pushed me out of my comfort zone, since I was stepping into a legacy project where I had to quickly understand prior work, coordinate a team, and contribute to something larger than a class assignment.",
        "I took on the role of Project Manager, where by following Agile development practices and Scrum ceremonies, I worked to keep the team aligned and ensure that our work meaningfully improved the Polaris product.",
      ],
    },
    {
      heading: "Our Job",
      paragraphs: [
        "My team’s responsibility was to help take Polaris from a set of independent pipelines and partial processes into something more repeatable, practical, and scalable. Our main goal was to map the UCF HEC building and improve the conversion workflow that turns building files into a usable indoor navigation format. That work was especially meaningful because it was local and tangible, happening right here at UCF. We were not only building toward a technical outcome, but also helping shape a process that could make future building deployments faster and more efficient.",
        "A major focus of our work was accessibility. Polaris is meant to serve users with a wide range of disabilities and mobility needs. My team worked alongside UCF Student Accessibility Services to better understand real user needs, expected accommodations, and the types of features that would make indoor navigation more usable in practice. That meant researching accessibility guidelines, documenting design requirements, and thinking carefully about how navigation information should be presented to support different types of users.",
      ],
    }
  ],
  techs: ["Swift", "Python", "Docker", "CloudFare", "Flask", "AutoCAD", "iOS", "MapKit", "IMDF", "QGIS", "GeoJSON", "Scrum", "Jira", "Inclusive Design"],
  links: [],
  media: [
    {src: blueprint, alt: "Layer Adjustment Step", kind: "image"},
    {src: phoneVideo, alt: "Polaris iOS app", kind: "video"},
  ],
  documents: [
    { label: "Design Document", href: fdd, kind: "pdf" }],
};
