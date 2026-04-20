export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectImage = {
  src: string;
  alt: string;
};

export type Project = {
  id: string;
  title: string;
  highlights: string[];
  techs: string[];
  links: ProjectLink[];
  images: ProjectImage[];
};
