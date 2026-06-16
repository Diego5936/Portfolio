import { Assets, Texture } from "pixi.js";
import down1Skin from "@/assets/blank_skin/down-1.png";
import down2Skin from "@/assets/blank_skin/down-2.png";
import left1Skin from "@/assets/blank_skin/left-1.png";
import left2Skin from "@/assets/blank_skin/left-2.png";
import right1Skin from "@/assets/blank_skin/right-1.png";
import right2Skin from "@/assets/blank_skin/right-2.png";
import up1Skin from "@/assets/blank_skin/up-1.png";
import up2Skin from "@/assets/blank_skin/up-2.png";
import type { FacingDirection, WalkFrame } from "@/components/skills/direction";

const BLANK_SKIN_SOURCES: Record<
    FacingDirection,
    Record<WalkFrame, string>
> = {
    north: { 1: up1Skin, 2: up2Skin },
    south: { 1: down1Skin, 2: down2Skin },
    west: { 1: left1Skin, 2: left2Skin },
    east: { 1: right1Skin, 2: right2Skin },
};

export type BlankSkinTextures = Record<
    FacingDirection,
    Record<WalkFrame, Texture>
>;

export async function loadBlankSkinTextures() {
    const entries = Object.entries(BLANK_SKIN_SOURCES).flatMap(
        ([direction, frames]) =>
            Object.entries(frames).map(([frame, src]) => ({
                alias: `blank-skin-${direction}-${frame}`,
                src,
            })),
    );

    await Assets.load(entries);

    const textures = Object.fromEntries(
        Object.entries(BLANK_SKIN_SOURCES).map(([direction, frames]) => [
            direction,
            Object.fromEntries(
                Object.keys(frames).map((frame) => {
                    const walkFrame = Number(frame) as WalkFrame;
                    const texture = Texture.from(
                        `blank-skin-${direction}-${frame}`,
                    );
                    texture.source.scaleMode = "nearest";
                    return [walkFrame, texture];
                }),
            ),
        ]),
    ) as BlankSkinTextures;

    return textures;
}
