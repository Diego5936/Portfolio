export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectMedia = {
  src: string;
  alt: string;
  kind: "image" | "video";
  poster?: string;
};

export type ProjectDescriptionSection = {
  heading: string;
  paragraphs: string[];
};

export type ProjectDocument = {
  label: string;
  href: string;
  kind: "pdf";
};

export type Project = {
  id: string;
  title: string;
  descriptionSections: ProjectDescriptionSection[];
  techs: string[];
  links: ProjectLink[];
  media: ProjectMedia[];
  documents?: ProjectDocument[];
};
