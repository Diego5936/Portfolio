import { pheratechSystemsExperience } from "@/data/experience/pheratech-systems";
import { ucfInstituteOfAiExperience } from "@/data/experience/ucf-institute-of-ai";
import type { ExperienceItem } from "@/data/experience/types";

export const experiences: ExperienceItem[] = [
  ucfInstituteOfAiExperience,
  pheratechSystemsExperience,
];

export type { ExperienceItem } from "@/data/experience/types";
