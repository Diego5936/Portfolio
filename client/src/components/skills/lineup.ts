import type { PanelBounds } from "@/components/skills/SkillNpc";
import { NPC_CONFIG } from "@/components/skills/npcConfig";
import type { Skill } from "@/data/skills/types";


export function getLineupPositions(skills: Skill[], bounds: PanelBounds) {
    const sorted = [...skills].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    const {
        lineupSpacing,
        lineupRowGap,
        lineupBottomOffset,
    } = NPC_CONFIG;

    const baseY = bounds.height - bounds.padding - lineupBottomOffset;
    const availableWidth = bounds.width - bounds.padding * 2;
    const maxPerRow = Math.max(1, Math.floor(availableWidth / lineupSpacing) + 1);
    const rowCount = Math.ceil(sorted.length / maxPerRow);
    const perRow = Math.ceil(sorted.length / rowCount);

    const rows: Skill[][] = [];
    for (let i = 0; i < sorted.length; i += perRow) {
        rows.push(sorted.slice(i, i + perRow));
    }

    const positions = new Map<string, { x: number; y: number }>();

    rows.forEach((rowSkills, rowIndex) => {
        const rowY = baseY - rowIndex * lineupRowGap;
        const totalWidth = (rowSkills.length - 1) * lineupSpacing;
        const startX = bounds.width / 2 - totalWidth / 2;

        rowSkills.forEach((skill, index) => {
            positions.set(skill.name, {
                x: startX + index * lineupSpacing,
                y: rowY,
            });
        });
    });

    return skills.map((skill) => positions.get(skill.name)!);
}
