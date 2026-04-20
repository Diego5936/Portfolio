import type { ExperienceItem } from "@/data/experience/types";
import ucfInstituteOfAiPoster from "@/data/experience/ucf-institute-of-ai/media/iai-poster.avif";
import ucfInstituteOfAiLogo from "@/data/experience/ucf-institute-of-ai/media/ucfiai_logo.jpg";

export const ucfInstituteOfAiExperience: ExperienceItem = {
  organization: "UCF's Institute of AI",
  role: "Undergraduate Research Assistant",
  dateEnd: "Present",
  dateStart: "February 2026",
  posterSrc: ucfInstituteOfAiPoster,
  posterAlt: "UCF Institute of AI poster",
  posterKind: "image",
  logoSrc: ucfInstituteOfAiLogo,
  logoAlt: "UCF Institute of AI logo",
  highlights: [
    "Undergraduate researcher working on language-driven robotics, exploring how Vision-Language-Action (VLA) models can reliably control heterogeneous robots. Conducting ongoing research into data structures and agentic paradigms for autonomous robotic task completion, while developing simulation infrastructure in NVIDIA Isaac Sim that exposes robot capabilities through structured APIs and enables LLMs to translate natural-language instructions into executable actions.",
  ],
};
