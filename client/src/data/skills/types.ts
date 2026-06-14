export type SkillCategory = "framework" | "language" | "tool";

export type Skill = {
    name: string;
    category: SkillCategory;
    sprite: string;
};
