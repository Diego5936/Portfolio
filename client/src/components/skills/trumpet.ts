import { Assets, Sprite, Texture } from "pixi.js";
import trumpetImage from "@/assets/trumpet.png";
import type { PanelBounds } from "@/components/skills/SkillNpc";
import { NPC_CONFIG } from "@/components/skills/npcConfig";

const TRUMPET_ALIAS = "trumpet";

export async function loadTrumpetTexture() {
    await Assets.load({ alias: TRUMPET_ALIAS, src: trumpetImage });
    const texture = Texture.from(TRUMPET_ALIAS);
    texture.source.scaleMode = "nearest";
    return texture;
}

export function createTrumpetButton(
    texture: Texture,
    bounds: PanelBounds,
    onSummon: () => void,
) {
    const trumpet = new Sprite(texture);
    trumpet.anchor.set(1, 1);
    trumpet.width = NPC_CONFIG.trumpetSize;
    trumpet.height = NPC_CONFIG.trumpetSize;
    trumpet.x = bounds.width - NPC_CONFIG.trumpetPadding;
    trumpet.y = bounds.height - NPC_CONFIG.trumpetPadding;
    trumpet.eventMode = "static";
    trumpet.cursor = "pointer";
    trumpet.on("pointertap", onSummon);
    return trumpet;
}
