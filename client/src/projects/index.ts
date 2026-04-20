import { aiTrainingEnvProject } from "@/projects/ai-training-env";
import { garminArcadeProject } from "@/projects/garmin-arcade";
import { hotdogProject } from "@/projects/hotdog";
import { polarisProject } from "@/projects/polaris";
import { realVillagersProject } from "@/projects/real-villagers";
import { strataProject } from "@/projects/strata";
import { thetaTauWebsiteProject } from "@/projects/thetatau-website";
import type { Project } from "@/projects/types";

export const projects: Project[] = [
  hotdogProject,
  polarisProject,
  thetaTauWebsiteProject,
  strataProject,
  garminArcadeProject,
  realVillagersProject,
  aiTrainingEnvProject,
];
