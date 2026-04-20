export type ExperienceItem = {
  organization: string;
  role: string;
  /** Shown first in the timeline (e.g. "Present" or end month/year). */
  dateEnd: string;
  /** Shown under dateEnd (e.g. start month/year). */
  dateStart: string;
  highlights: string[];
  posterSrc: string;
  posterAlt: string;
  posterKind: "image" | "video";
  logoSrc: string;
  logoAlt: string;
};
