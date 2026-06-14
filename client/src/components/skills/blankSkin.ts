import { Assets, Texture } from "pixi.js";
import southSkin from "@/assets/blank_skin/south.png";

const SOUTH_ALIAS = "blank-skin-south";

export async function loadBlankSkinSouth() {
    await Assets.load({ alias: SOUTH_ALIAS, src: southSkin });
    const texture = Texture.from(SOUTH_ALIAS);
    texture.source.scaleMode = "nearest";
    return texture;
}
