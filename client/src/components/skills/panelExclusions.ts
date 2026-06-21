import { getCategoryFilterColumnBounds } from "@/components/skills/categoryFilterSprites";
import { NPC_CONFIG } from "@/components/skills/npcConfig";
import type { PanelBounds } from "@/components/skills/SkillNpc";
import { getTrumpetBounds } from "@/components/skills/trumpet";

export type UiRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export function getPanelExclusionRects(bounds: PanelBounds): UiRect[] {
    return [
        getCategoryFilterColumnBounds(bounds),
        getTrumpetBounds(bounds),
    ];
}

function npcOverlapsRect(
    x: number,
    y: number,
    half: number,
    margin: number,
    rect: UiRect,
) {
    return (
        x + half + margin > rect.x &&
        x - half - margin < rect.x + rect.width &&
        y + half + margin > rect.y &&
        y - half - margin < rect.y + rect.height
    );
}

export function isPositionInPanelExclusion(
    x: number,
    y: number,
    bounds: PanelBounds,
) {
    const half = NPC_CONFIG.size / 2;
    const margin = NPC_CONFIG.uiExclusionMargin;

    return getPanelExclusionRects(bounds).some((rect) =>
        npcOverlapsRect(x, y, half, margin, rect),
    );
}

export function resolvePositionFromPanelExclusions(
    x: number,
    y: number,
    bounds: PanelBounds,
) {
    const half = NPC_CONFIG.size / 2;
    const margin = NPC_CONFIG.uiExclusionMargin;
    let resolvedX = x;
    let resolvedY = y;

    for (const rect of getPanelExclusionRects(bounds)) {
        const left = rect.x - half - margin;
        const right = rect.x + rect.width + half + margin;
        const top = rect.y - half - margin;
        const bottom = rect.y + rect.height + half + margin;

        if (
            resolvedX < left ||
            resolvedX > right ||
            resolvedY < top ||
            resolvedY > bottom
        ) {
            continue;
        }

        const distLeft = resolvedX - left;
        const distRight = right - resolvedX;
        const distTop = resolvedY - top;
        const distBottom = bottom - resolvedY;
        const min = Math.min(distLeft, distRight, distTop, distBottom);

        if (min === distLeft) {
            resolvedX = left;
        } else if (min === distRight) {
            resolvedX = right;
        } else if (min === distTop) {
            resolvedY = top;
        } else {
            resolvedY = bottom;
        }
    }

    return { x: resolvedX, y: resolvedY };
}
