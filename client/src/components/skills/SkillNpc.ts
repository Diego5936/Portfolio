import { Container, Sprite, Text } from "pixi.js";
import type { BlankSkinTextures } from "@/components/skills/blankSkin";
import {
    directionFromDelta,
    randomLookDirections,
    type FacingDirection,
    type WalkFrame,
} from "@/components/skills/direction";
import { NPC_CONFIG } from "@/components/skills/npcConfig";
import type { Skill } from "@/data/skills/types";

export type PanelBounds = {
    width: number;
    height: number;
    padding: number;
};


function minDistanceToOthers(
    x: number,
    y: number,
    others: readonly SkillNpc[],
): number {
    let minDistance = Infinity;

    for (const other of others) {
        minDistance = Math.min(
            minDistance,
            Math.hypot(x - other.x, y - other.y),
            Math.hypot(x - other.targetX, y - other.targetY),
        );
    }

    return minDistance;
}

export class SkillNpc {
    skill: Skill;
    container: Container;
    nameTag: Container;
    sprite: Sprite;
    label: Text;
    textures: BlankSkinTextures;
    facing: FacingDirection;
    homeX: number;
    homeY: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    speed: number;
    pauseTimer: number;
    leaveRollTimer: number;
    postStayTimer: number;
    lookTimer: number;
    lookQueue: FacingDirection[];
    lookIndex: number;
    preMoveTimer: number;
    walkAnimTimer: number;
    walkFrame: WalkFrame;
    wandering: boolean;
    summoning: boolean;
    looking: boolean;
    pickRetryPending: boolean;

    constructor(
        skill: Skill,
        textures: BlankSkinTextures,
        startX: number,
        startY: number,
    ) {
        this.skill = skill;
        this.textures = textures;
        this.facing = "south";
        this.homeX = startX;
        this.homeY = startY;
        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        this.speed =
            NPC_CONFIG.speedMin +
            Math.random() * (NPC_CONFIG.speedMax - NPC_CONFIG.speedMin);
        this.pauseTimer = 0;
        this.leaveRollTimer = 0;
        this.postStayTimer = 0;
        this.lookTimer = 0;
        this.lookQueue = [];
        this.lookIndex = 0;
        this.preMoveTimer = 0;
        this.walkAnimTimer = 0;
        this.walkFrame = 1;
        this.wandering = false;
        this.summoning = false;
        this.looking = false;
        this.pickRetryPending = false;

        this.container = new Container();
        this.container.x = startX;
        this.container.y = startY;

        this.sprite = new Sprite(textures.south[1]);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.width = NPC_CONFIG.size;
        this.sprite.height = NPC_CONFIG.size;
        this.container.addChild(this.sprite);

        this.nameTag = new Container();
        this.container.addChild(this.nameTag);

        this.label = new Text({
            text: skill.name,
            anchor: { x: 0.5, y: 1 },
            style: {
                fontFamily: "system-ui, sans-serif",
                fontSize: NPC_CONFIG.labelFontSize,
                fill: 0xffffff,
                align: "center",
                padding: 0,
            },
        });
        this.nameTag.addChild(this.label);
        this.layoutLabel();
    }

    layoutLabel() {
        const spriteTop = -this.sprite.height / 2;
        const headTop =
            spriteTop + this.sprite.height * NPC_CONFIG.headTopInsetRatio;

        this.nameTag.x = 0;
        this.nameTag.y = headTop - NPC_CONFIG.labelGap;
    }

    setIdleFacing(direction: FacingDirection) {
        this.facing = direction;
        this.walkAnimTimer = 0;
        this.walkFrame = 1;
        this.sprite.texture = this.textures[direction][1];
    }

    updateWalkFacing(direction: FacingDirection, dt: number) {
        if (this.facing !== direction) {
            this.facing = direction;
            this.walkAnimTimer = 0;
            this.walkFrame = 1;
        }

        this.walkAnimTimer += dt;

        if (this.walkAnimTimer >= NPC_CONFIG.walkFrameDurationSeconds) {
            this.walkAnimTimer -= NPC_CONFIG.walkFrameDurationSeconds;
            this.walkFrame = this.walkFrame === 1 ? 2 : 1;
        }

        this.sprite.texture = this.textures[direction][this.walkFrame];
    }

    faceToward(x: number, y: number) {
        this.setIdleFacing(directionFromDelta(x - this.x, y - this.y));
    }

    faceMovement(dx: number, dy: number, dt: number) {
        this.updateWalkFacing(directionFromDelta(dx, dy), dt);
    }

    beginLookAround() {
        const lookCount =
            NPC_CONFIG.lookDirectionCountMin +
            Math.floor(
                Math.random() *
                    (NPC_CONFIG.lookDirectionCountMax -
                        NPC_CONFIG.lookDirectionCountMin +
                        1),
            );

        this.looking = true;
        this.lookIndex = 0;
        this.lookQueue = randomLookDirections(lookCount, this.facing);
        this.lookTimer = NPC_CONFIG.lookDirectionDurationSeconds;

        if (this.lookQueue.length === 0) {
            this.looking = false;
            return;
        }

        this.setIdleFacing(this.lookQueue[0]);
    }

    updateLook(dt: number, bounds: PanelBounds, others: readonly SkillNpc[]) {
        this.lookTimer -= dt;

        if (this.lookTimer > 0) {
            return;
        }

        this.lookIndex += 1;

        if (this.lookIndex >= this.lookQueue.length) {
            this.looking = false;
            this.decideAfterLook(bounds, others);
            return;
        }

        this.setIdleFacing(this.lookQueue[this.lookIndex]);
        this.lookTimer = NPC_CONFIG.lookDirectionDurationSeconds;
    }

    tryBeginLookOrMove(bounds: PanelBounds, others: readonly SkillNpc[]) {
        if (Math.random() < NPC_CONFIG.lookAroundChance) {
            this.beginLookAround();
            return;
        }

        this.decideAfterLook(bounds, others);
    }

    decideAfterLook(bounds: PanelBounds, others: readonly SkillNpc[]) {
        if (Math.random() < NPC_CONFIG.lookThenMoveChance) {
            if (this.pickNewTarget(bounds, others)) {
                return;
            }

            this.pickRetryPending = true;
            return;
        }

        this.pauseTimer =
            NPC_CONFIG.pauseMinSeconds +
            Math.random() *
                (NPC_CONFIG.pauseMaxSeconds - NPC_CONFIG.pauseMinSeconds);
    }

    beginPreMove() {
        this.faceToward(this.targetX, this.targetY);
        this.preMoveTimer = NPC_CONFIG.preMoveLookDurationSeconds;
    }

    beginSummon() {
        this.wandering = false;
        this.looking = false;
        this.lookQueue = [];
        this.pauseTimer = 0;
        this.preMoveTimer = 0;
        this.leaveRollTimer = 0;

        const atHome =
            Math.hypot(this.homeX - this.x, this.homeY - this.y) <
            NPC_CONFIG.arriveDistance;

        if (atHome) {
            this.summoning = false;
            this.x = this.homeX;
            this.y = this.homeY;
            this.container.x = this.x;
            this.container.y = this.y;
            this.setIdleFacing("south");
            this.postStayTimer = NPC_CONFIG.stayTimeAfterSummonSeconds;
            return;
        }

        this.summoning = true;
        this.targetX = this.homeX;
        this.targetY = this.homeY;
        this.setIdleFacing(directionFromDelta(this.homeX - this.x, this.homeY - this.y));
    }

    updateAtPost(dt: number, bounds: PanelBounds, others: readonly SkillNpc[]) {
        if (this.postStayTimer > 0) {
            this.postStayTimer -= dt;
            return;
        }

        this.tryLeavePost(dt, bounds, others);
    }

    updateSummon(dt: number) {
        const dx = this.homeX - this.x;
        const dy = this.homeY - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < NPC_CONFIG.arriveDistance) {
            this.x = this.homeX;
            this.y = this.homeY;
            this.container.x = this.x;
            this.container.y = this.y;
            this.summoning = false;
            this.setIdleFacing("south");
            this.postStayTimer = NPC_CONFIG.stayTimeAfterSummonSeconds;
            return;
        }

        this.faceMovement(dx, dy, dt);

        const step = NPC_CONFIG.summonSpeed * dt;
        this.x += (dx / distance) * step;
        this.y += (dy / distance) * step;
        this.container.x = this.x;
        this.container.y = this.y;
    }

    tryLeavePost(
        dt: number,
        bounds: PanelBounds,
        others: readonly SkillNpc[],
    ) {
        this.leaveRollTimer += dt;

        if (this.leaveRollTimer < NPC_CONFIG.leaveRollIntervalSeconds) {
            return;
        }

        this.leaveRollTimer -= NPC_CONFIG.leaveRollIntervalSeconds;

        if (Math.random() < NPC_CONFIG.leaveChance) {
            this.beginWandering(bounds, others);
        }
    }

    beginWandering(bounds: PanelBounds, others: readonly SkillNpc[]) {
        this.wandering = true;
        this.tryBeginLookOrMove(bounds, others);
    }

    pickNewTarget(bounds: PanelBounds, others: readonly SkillNpc[]): boolean {
        const { width, height, padding } = bounds;
        const minX = padding;
        const maxX = width - padding;
        const minY = padding;
        const maxY = height - padding;

        let best: { x: number; y: number; clearance: number } | null = null;

        for (let i = 0; i < NPC_CONFIG.wanderPickAttempts; i++) {
            const x = minX + Math.random() * (maxX - minX);
            const y = minY + Math.random() * (maxY - minY);
            const clearance = minDistanceToOthers(x, y, others);

            if (clearance < NPC_CONFIG.minNpcSeparation) {
                continue;
            }

            if (!best || clearance > best.clearance) {
                best = { x, y, clearance };
            }
        }

        if (!best) {
            return false;
        }

        this.pickRetryPending = false;
        this.targetX = best.x;
        this.targetY = best.y;
        this.beginPreMove();
        return true;
    }

    applyMoveSeparation(
        others: readonly SkillNpc[],
        moveX: number,
        moveY: number,
    ): { x: number; y: number } {
        let sepX = 0;
        let sepY = 0;

        for (const other of others) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.hypot(dx, dy);

            if (
                distance <= 0 ||
                distance >= NPC_CONFIG.moveSeparationRadius
            ) {
                continue;
            }

            const strength =
                (NPC_CONFIG.moveSeparationRadius - distance) /
                NPC_CONFIG.moveSeparationRadius;
            sepX += (dx / distance) * strength;
            sepY += (dy / distance) * strength;
        }

        const sepLength = Math.hypot(sepX, sepY);
        if (sepLength <= 0) {
            return { x: moveX, y: moveY };
        }

        const blend = NPC_CONFIG.moveSeparationStrength;
        const combinedX = moveX + (sepX / sepLength) * blend;
        const combinedY = moveY + (sepY / sepLength) * blend;
        const combinedLength = Math.hypot(combinedX, combinedY);

        if (combinedLength <= 0) {
            return { x: moveX, y: moveY };
        }

        return {
            x: (combinedX / combinedLength) * Math.hypot(moveX, moveY),
            y: (combinedY / combinedLength) * Math.hypot(moveX, moveY),
        };
    }

    update(dt: number, bounds: PanelBounds, others: readonly SkillNpc[]) {
        if (!this.wandering) {
            return;
        }

        if (this.looking) {
            this.updateLook(dt, bounds, others);
            return;
        }

        if (this.preMoveTimer > 0) {
            this.preMoveTimer -= dt;
            return;
        }

        if (this.pauseTimer > 0) {
            this.pauseTimer -= dt;
            if (this.pauseTimer <= 0) {
                this.tryBeginLookOrMove(bounds, others);
            }
            return;
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < NPC_CONFIG.arriveDistance) {
            this.setIdleFacing(this.facing);

            if (this.pickRetryPending) {
                if (!this.pickNewTarget(bounds, others)) {
                    return;
                }
                return;
            }

            this.pauseTimer =
                NPC_CONFIG.pauseMinSeconds +
                Math.random() *
                    (NPC_CONFIG.pauseMaxSeconds - NPC_CONFIG.pauseMinSeconds);
            return;
        }

        this.faceMovement(dx, dy, dt);

        const step = this.speed * dt;
        const move = this.applyMoveSeparation(
            others,
            (dx / distance) * step,
            (dy / distance) * step,
        );

        this.x += move.x;
        this.y += move.y;

        this.container.x = this.x;
        this.container.y = this.y;
    }
}
