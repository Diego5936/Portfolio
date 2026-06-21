import { Assets, Container, Sprite, Texture } from "pixi.js";
import aiFilterImage from "@/assets/skills-sections/filters/ai.png";
import aiSelectedFilterImage from "@/assets/skills-sections/filters/ai-selected.png";
import allFilterImage from "@/assets/skills-sections/filters/all.png";
import allSelectedFilterImage from "@/assets/skills-sections/filters/all-selected.png";
import devopsFilterImage from "@/assets/skills-sections/filters/devops.png";
import devopsSelectedFilterImage from "@/assets/skills-sections/filters/devops-selected.png";
import frameworksFilterImage from "@/assets/skills-sections/filters/frameworks.png";
import frameworksSelectedFilterImage from "@/assets/skills-sections/filters/frameworks-selected.png";
import languagesFilterImage from "@/assets/skills-sections/filters/languages.png";
import languagesSelectedFilterImage from "@/assets/skills-sections/filters/languages-selected.png";
import roboticsFilterImage from "@/assets/skills-sections/filters/robotics.png";
import roboticsSelectedFilterImage from "@/assets/skills-sections/filters/robotics-selected.png";
import toolsFilterImage from "@/assets/skills-sections/filters/tools.png";
import toolsSelectedFilterImage from "@/assets/skills-sections/filters/tools-selected.png";
import {
    CATEGORY_FILTERS,
    type CategoryFilterId,
} from "@/components/skills/categoryFilter";
import type { PanelBounds } from "@/components/skills/SkillNpc";

const FILTER_NATIVE_WIDTH = 66;
const FILTER_NATIVE_HEIGHT = 30;
const FILTER_SIZE = 122;
const FILTER_PADDING = 12;
const FILTER_GAP = -1.5;
const FILTER_UNSELECTED_ALPHA = 0.72;

const FILTER_SOURCES: Record<
    CategoryFilterId,
    { default: string; selected: string }
> = {
    all: { default: allFilterImage, selected: allSelectedFilterImage },
    devops: { default: devopsFilterImage, selected: devopsSelectedFilterImage },
    ai: { default: aiFilterImage, selected: aiSelectedFilterImage },
    robotics: {
        default: roboticsFilterImage,
        selected: roboticsSelectedFilterImage,
    },
    tool: { default: toolsFilterImage, selected: toolsSelectedFilterImage },
    language: {
        default: languagesFilterImage,
        selected: languagesSelectedFilterImage,
    },
    framework: {
        default: frameworksFilterImage,
        selected: frameworksSelectedFilterImage,
    },
};

export type CategoryFilterTextureSet = {
    default: Texture;
    selected: Texture;
};

export type CategoryFilterTextures = Record<
    CategoryFilterId,
    CategoryFilterTextureSet
>;

function textureFromAlias(alias: string) {
    const texture = Texture.from(alias);
    texture.source.scaleMode = "nearest";
    return texture;
}

export async function loadCategoryFilterTextures(): Promise<CategoryFilterTextures> {
    const entries = Object.entries(FILTER_SOURCES).flatMap(([id, sources]) => [
        { alias: `category-filter-${id}`, src: sources.default },
        { alias: `category-filter-${id}-selected`, src: sources.selected },
    ]);

    await Assets.load(entries);

    return Object.fromEntries(
        Object.keys(FILTER_SOURCES).map((id) => [
            id,
            {
                default: textureFromAlias(`category-filter-${id}`),
                selected: textureFromAlias(`category-filter-${id}-selected`),
            },
        ]),
    ) as CategoryFilterTextures;
}

type CategoryFilterControls = {
    container: Container;
    setSelected: (id: CategoryFilterId) => void;
};

export function createCategoryFilters(
    textures: CategoryFilterTextures,
    bounds: PanelBounds,
    onSelect: (id: CategoryFilterId) => void,
): CategoryFilterControls {
    const container = new Container();
    const sprites = new Map<CategoryFilterId, Sprite>();
    let selectedId: CategoryFilterId = "all";

    function applySpriteState(filterId: CategoryFilterId, hovered = false) {
        const sprite = sprites.get(filterId);
        if (!sprite) {
            return;
        }

        const isSelected = filterId === selectedId;

        if (isSelected) {
            sprite.texture = textures[filterId].selected;
            sprite.alpha = 1;
            return;
        }

        sprite.texture = textures[filterId].default;
        sprite.alpha = hovered ? 1 : FILTER_UNSELECTED_ALPHA;
    }

    function applySelection(id: CategoryFilterId) {
        selectedId = id;

        for (const filterId of sprites.keys()) {
            applySpriteState(filterId);
        }
    }

    let y = bounds.height - FILTER_PADDING;

    for (const filter of [...CATEGORY_FILTERS].reverse()) {
        const sprite = new Sprite(textures[filter.id].default);
        sprite.anchor.set(0, 1);
        sprite.width = FILTER_SIZE;
        sprite.height =
            FILTER_SIZE * (FILTER_NATIVE_HEIGHT / FILTER_NATIVE_WIDTH);
        sprite.x = FILTER_PADDING;
        sprite.y = y;
        sprite.eventMode = "static";
        sprite.cursor = "pointer";
        sprite.on("pointertap", () => onSelect(filter.id));
        sprite.on("pointerover", () => applySpriteState(filter.id, true));
        sprite.on("pointerout", () => applySpriteState(filter.id, false));

        sprites.set(filter.id, sprite);
        container.addChild(sprite);
        y -= sprite.height + FILTER_GAP;
    }

    applySelection(selectedId);

    return {
        container,
        setSelected: applySelection,
    };
}

export function getCategoryFilterColumnBounds(bounds: PanelBounds) {
    const filterHeight =
        FILTER_SIZE * (FILTER_NATIVE_HEIGHT / FILTER_NATIVE_WIDTH);
    const count = CATEGORY_FILTERS.length;
    const stackHeight = count * filterHeight + (count - 1) * FILTER_GAP;

    return {
        x: FILTER_PADDING,
        y: bounds.height - FILTER_PADDING - stackHeight,
        width: FILTER_SIZE,
        height: stackHeight,
    };
}
