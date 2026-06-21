import { Assets, Container, Sprite, Texture } from "pixi.js";
import lineupSignImage from "@/assets/skills-sections/lineup/lineup-sign.png";
import trumpetHoverImage from "@/assets/skills-sections/lineup/trumpet-hover.png";
import trumpetImage from "@/assets/skills-sections/lineup/trumpet.png";
import type { PanelBounds } from "@/components/skills/SkillNpc";
import { NPC_CONFIG } from "@/components/skills/npcConfig";

const TRUMPET_ALIAS = "trumpet";
const TRUMPET_HOVER_ALIAS = "trumpet-hover";
const LINEUP_SIGN_ALIAS = "lineup-sign";

export type TrumpetTextures = {
    default: Texture;
    hover: Texture;
    lineupSign: Texture;
};

export async function loadTrumpetTextures(): Promise<TrumpetTextures> {
    await Assets.load([
        { alias: TRUMPET_ALIAS, src: trumpetImage },
        { alias: TRUMPET_HOVER_ALIAS, src: trumpetHoverImage },
        { alias: LINEUP_SIGN_ALIAS, src: lineupSignImage },
    ]);

    const defaultTexture = Texture.from(TRUMPET_ALIAS);
    const hoverTexture = Texture.from(TRUMPET_HOVER_ALIAS);
    const lineupSignTexture = Texture.from(LINEUP_SIGN_ALIAS);

    for (const texture of [defaultTexture, hoverTexture, lineupSignTexture]) {
        texture.source.scaleMode = "nearest";
    }

    return {
        default: defaultTexture,
        hover: hoverTexture,
        lineupSign: lineupSignTexture,
    };
}

function getTrumpetRect(bounds: PanelBounds) {
    return {
        left: bounds.width - NPC_CONFIG.trumpetOffsetX - NPC_CONFIG.trumpetSize,
        top: bounds.height - NPC_CONFIG.trumpetOffsetY - NPC_CONFIG.trumpetSize,
        right: bounds.width - NPC_CONFIG.trumpetOffsetX,
        bottom: bounds.height - NPC_CONFIG.trumpetOffsetY,
    };
}

function getLineupSignRect(bounds: PanelBounds) {
    const halfWidth = NPC_CONFIG.lineupSignSize / 2;

    return {
        left: bounds.width - NPC_CONFIG.lineupSignOffsetX - halfWidth,
        top: bounds.height - NPC_CONFIG.lineupSignOffsetY - NPC_CONFIG.lineupSignSize,
        right: bounds.width - NPC_CONFIG.lineupSignOffsetX + halfWidth,
        bottom: bounds.height - NPC_CONFIG.lineupSignOffsetY,
    };
}

export function getTrumpetBounds(bounds: PanelBounds) {
    const trumpet = getTrumpetRect(bounds);
    const sign = getLineupSignRect(bounds);

    const left = Math.min(trumpet.left, sign.left);
    const top = Math.min(trumpet.top, sign.top);
    const right = Math.max(trumpet.right, sign.right);
    const bottom = Math.max(trumpet.bottom, sign.bottom);

    return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
    };
}

export function createTrumpetButton(
    textures: TrumpetTextures,
    bounds: PanelBounds,
    onSummon: () => void,
) {
    const container = new Container();

    const sign = new Sprite(textures.lineupSign);
    sign.anchor.set(0.5, 1);
    sign.width = NPC_CONFIG.lineupSignSize;
    sign.height = NPC_CONFIG.lineupSignSize;
    sign.x = bounds.width - NPC_CONFIG.lineupSignOffsetX;
    sign.y = bounds.height - NPC_CONFIG.lineupSignOffsetY;
    sign.eventMode = "none";
    sign.visible = false;

    const trumpet = new Sprite(textures.default);
    trumpet.anchor.set(1, 1);
    trumpet.width = NPC_CONFIG.trumpetSize;
    trumpet.height = NPC_CONFIG.trumpetSize;
    trumpet.x = bounds.width - NPC_CONFIG.trumpetOffsetX;
    trumpet.y = bounds.height - NPC_CONFIG.trumpetOffsetY;
    trumpet.eventMode = "static";
    trumpet.cursor = "pointer";
    trumpet.on("pointerover", () => {
        trumpet.texture = textures.hover;
    });
    trumpet.on("pointerout", () => {
        trumpet.texture = textures.default;
    });
    trumpet.on("pointertap", onSummon);

    container.addChild(sign, trumpet);
    return { container, lineupSign: sign };
}
