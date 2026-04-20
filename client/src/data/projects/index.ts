import { aiTrainingEnvProject } from "@/data/projects/ai-training-env";
import { garminArcadeProject } from "@/data/projects/garmin-arcade";
import { hotdogProject } from "@/data/projects/hotdog";
import { polarisProject } from "@/data/projects/polaris";
import { realVillagersProject } from "@/data/projects/real-villagers";
import { strataProject } from "@/data/projects/strata";
import { thetaTauWebsiteProject } from "@/data/projects/thetatau-website";
import type { Project } from "@/data/projects/types";

export const projects: Project[] = [
  hotdogProject,
  polarisProject,
  thetaTauWebsiteProject,
  strataProject,
  garminArcadeProject,
  realVillagersProject,
  aiTrainingEnvProject,
];
