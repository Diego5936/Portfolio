export type SkillCategory =
    | "framework"
    | "language"
    | "tool"
    | "robotics"
    | "ai"
    | "devops";

export type Skill = {
    name: string;
    category: SkillCategory;
    sprite: string;
};
