import type { SkillCategory } from "@/data/skills/types";

export type CategoryFilterId = SkillCategory | "all";

export type CategoryFilterOption = {
    id: CategoryFilterId;
    label: string;
};



export const CATEGORY_FILTERS: CategoryFilterOption[] = [
    { id: "devops", label: "DevOps" },
    { id: "ai", label: "AI" },
    { id: "robotics", label: "Robotics" },
    { id: "tool", label: "Tools" },
    { id: "language", label: "Languages" },
    { id: "framework", label: "Frameworks" },
    { id: "all", label: "All" },
];
