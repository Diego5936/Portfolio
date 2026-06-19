import { Container, FederatedPointerEvent, Rectangle, Sprite, Text } from "pixi.js";
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
    exiting: boolean;
    hidden: boolean;
    inFilter: boolean;
    summonHoldPost: boolean;
    looking: boolean;
    pickRetryPending: boolean;
    hovered: boolean;
    dragging: boolean;
    hangAnimTimer: number;
    hangFrame: WalkFrame;
    landing: boolean;
    landingTimer: number;
    private dragContext: { stage: Container; bounds: PanelBounds } | null;

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
        this.exiting = false;
        this.hidden = false;
        this.inFilter = true;
        this.summonHoldPost = true;
        this.looking = false;
        this.pickRetryPending = false;
        this.hovered = false;
        this.dragging = false;
        this.hangAnimTimer = 0;
        this.hangFrame = 1;
        this.landing = false;
        this.landingTimer = 0;
        this.dragContext = null;

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

    applyHangPose(scale: number) {
        this.container.scale.set(scale);

        const liftRange = NPC_CONFIG.hangDragScale - 1;
        const liftT = liftRange > 0 ? (scale - 1) / liftRange : 0;
        this.sprite.y = NPC_CONFIG.hangLiftOffsetY * Math.max(0, Math.min(1, liftT));
        this.layoutLabel();
    }

    resetVisualPose() {
        this.container.scale.set(1);
        this.sprite.y = 0;
        this.layoutLabel();
    }

    advanceHangAnimation(dt: number) {
        this.hangAnimTimer += dt;

        if (this.hangAnimTimer >= NPC_CONFIG.walkFrameDurationSeconds) {
            this.hangAnimTimer -= NPC_CONFIG.walkFrameDurationSeconds;
            this.hangFrame = this.hangFrame === 1 ? 2 : 1;
        }

        this.sprite.texture = this.textures.hang[this.hangFrame];
    }

    beginHover() {
        if (this.dragging || this.landing) {
            return;
        }

        this.hovered = true;
        this.setIdleFacing("south");
    }

    endHover() {
        if (this.dragging || this.landing) {
            return;
        }

        this.hovered = false;
    }

    getHangHandLocalPosition() {
        const half = NPC_CONFIG.size / 2;

        return {
            x:
                half * NPC_CONFIG.hangHandLocalX +
                NPC_CONFIG.hangHandOffsetX,
            y:
                this.sprite.y -
                half * NPC_CONFIG.hangHandLocalY +
                NPC_CONFIG.hangHandOffsetY,
        };
    }

    getHangHandParentOffset(scale: number) {
        const hand = this.getHangHandLocalPosition();

        return {
            x: hand.x * scale,
            y: hand.y * scale,
        };
    }

    setPositionFromHandPointer(
        pointerX: number,
        pointerY: number,
        scale: number,
    ) {
        const offset = this.getHangHandParentOffset(scale);
        this.x = pointerX - offset.x;
        this.y = pointerY - offset.y;
        this.container.x = this.x;
        this.container.y = this.y;
    }

    clampToBounds(bounds: PanelBounds) {
        const half = NPC_CONFIG.size / 2;
        const { width, height, padding } = bounds;

        this.x = Math.min(
            width - padding - half,
            Math.max(padding + half, this.x),
        );
        this.y = Math.min(
            height - padding - half,
            Math.max(padding + half, this.y),
        );
        this.container.x = this.x;
        this.container.y = this.y;
    }

    beginDrag(event: FederatedPointerEvent) {
        const parent = this.container.parent;
        if (!parent || !this.dragContext) {
            return;
        }

        const local = event.getLocalPosition(parent);
        this.dragging = true;
        this.landing = false;
        this.landingTimer = 0;
        this.hangAnimTimer = 0;
        this.hangFrame = 1;
        this.applyHangPose(NPC_CONFIG.hangDragScale);
        this.sprite.texture = this.textures.hang[1];
        this.setPositionFromHandPointer(
            local.x,
            local.y,
            NPC_CONFIG.hangDragScale,
        );
        parent.addChild(this.container);

        const { stage } = this.dragContext;
        stage.eventMode = "static";
        stage.on("pointermove", this.onPointerMove);
        stage.on("pointerup", this.onPointerUp);
        stage.on("pointerupoutside", this.onPointerUp);
    }

    private releaseDragListeners() {
        if (!this.dragContext) {
            return;
        }

        const { stage } = this.dragContext;
        stage.off("pointermove", this.onPointerMove);
        stage.off("pointerup", this.onPointerUp);
        stage.off("pointerupoutside", this.onPointerUp);
        stage.eventMode = "passive";
    }

    endDrag() {
        if (!this.dragging || !this.dragContext) {
            return;
        }

        this.releaseDragListeners();

        this.dragging = false;
        this.hovered = false;
        this.targetX = this.x;
        this.targetY = this.y;
        this.landing = true;
        this.landingTimer = 0;
        this.hangAnimTimer = 0;
        this.hangFrame = 1;
        this.sprite.texture = this.textures.hang[1];
    }

    updateDrag(dt: number) {
        if (!this.dragging) {
            return;
        }

        this.advanceHangAnimation(dt);
        this.applyHangPose(NPC_CONFIG.hangDragScale);
    }

    updateLanding(dt: number, bounds: PanelBounds, others: readonly SkillNpc[]) {
        if (!this.landing) {
            return;
        }

        this.advanceHangAnimation(dt);

        this.landingTimer += dt;
        const progress = Math.min(
            1,
            this.landingTimer / NPC_CONFIG.hangLandDurationSeconds,
        );
        const eased = 1 - (1 - progress) * (1 - progress);
        const scale = NPC_CONFIG.hangDragScale + (1 - NPC_CONFIG.hangDragScale) * eased;
        this.applyHangPose(scale);

        if (progress < 1) {
            return;
        }

        this.landing = false;
        this.landingTimer = 0;
        this.resetVisualPose();
        this.setIdleFacing("south");

        if (this.wandering) {
            this.tryBeginLookOrMove(bounds, others);
        }
    }

    private onPointerDown = (event: FederatedPointerEvent) => {
        if (!this.hovered || this.landing) {
            return;
        }

        this.beginDrag(event);
    };

    private onPointerMove = (event: FederatedPointerEvent) => {
        if (!this.dragging || !this.dragContext) {
            return;
        }

        const parent = this.container.parent;
        if (!parent) {
            return;
        }

        const local = event.getLocalPosition(parent);
        this.setPositionFromHandPointer(
            local.x,
            local.y,
            NPC_CONFIG.hangDragScale,
        );
        this.clampToBounds(this.dragContext.bounds);
        this.targetX = this.x;
        this.targetY = this.y;
    };

    private onPointerUp = () => {
        this.endDrag();
    };

    setupPointerEvents(stage: Container, bounds: PanelBounds) {
        this.dragContext = { stage, bounds };

        const spriteHalf = NPC_CONFIG.size / 2;
        const top = this.nameTag.y - this.label.height;
        const height = spriteHalf - top;

        this.container.eventMode = "static";
        this.container.hitArea = new Rectangle(
            -spriteHalf,
            top,
            NPC_CONFIG.size,
            height,
        );
        this.container.on("pointerover", () => this.beginHover());
        this.container.on("pointerout", () => this.endHover());
        this.container.on("pointerdown", this.onPointerDown);
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

    setHome(x: number, y: number) {
        this.homeX = x;
        this.homeY = y;
    }

    setInFilter(inFilter: boolean) {
        this.inFilter = inFilter;
    }

    private resetMotionState() {
        if (this.dragging) {
            this.releaseDragListeners();
        }

        this.wandering = false;
        this.looking = false;
        this.lookQueue = [];
        this.pauseTimer = 0;
        this.preMoveTimer = 0;
        this.leaveRollTimer = 0;
        this.postStayTimer = 0;
        this.dragging = false;
        this.landing = false;
        this.landingTimer = 0;
        this.hovered = false;
        this.resetVisualPose();
    }

    reactivateFromHidden(homeX: number, homeY: number) {
        this.hidden = false;
        this.exiting = false;
        this.container.visible = true;
        this.container.eventMode = "static";
        this.homeX = homeX;
        this.homeY = homeY;
        this.x = homeX;
        const stagger =
            NPC_CONFIG.reenterStaggerMin +
            Math.random() *
                (NPC_CONFIG.reenterStaggerMax - NPC_CONFIG.reenterStaggerMin);
        this.y = NPC_CONFIG.reenterOffscreenY - stagger;
        this.container.x = this.x;
        this.container.y = this.y;
    }

    beginExit() {
        this.resetMotionState();
        this.inFilter = false;
        this.exiting = true;
        this.summoning = true;
        this.targetX = this.x;
        this.targetY = NPC_CONFIG.exitOffscreenY;
        this.setIdleFacing("north");
    }

    beginSummon(options?: { holdPost?: boolean }) {
        const holdPost = options?.holdPost ?? true;
        this.summonHoldPost = holdPost;

        this.resetMotionState();
        this.exiting = false;

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
            this.postStayTimer = holdPost
                ? NPC_CONFIG.stayTimeAfterSummonSeconds
                : 0;
            return;
        }

        this.summoning = true;
        this.targetX = this.homeX;
        this.targetY = this.homeY;
        this.setIdleFacing(directionFromDelta(this.homeX - this.x, this.homeY - this.y));
    }

    updateAtPost(dt: number, bounds: PanelBounds, others: readonly SkillNpc[]) {
        if (!this.inFilter || this.hidden || this.hovered || this.dragging || this.landing) {
            return;
        }

        if (this.postStayTimer > 0) {
            this.postStayTimer -= dt;
            return;
        }

        this.tryLeavePost(dt, bounds, others);
    }

    updateSummon(dt: number) {
        if (this.hovered || this.dragging || this.landing) {
            return;
        }

        const targetX = this.exiting ? this.targetX : this.homeX;
        const targetY = this.exiting ? this.targetY : this.homeY;
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < NPC_CONFIG.arriveDistance) {
            this.x = targetX;
            this.y = targetY;
            this.container.x = this.x;
            this.container.y = this.y;

            if (this.exiting) {
                this.exiting = false;
                this.summoning = false;
                this.hidden = true;
                this.container.visible = false;
                this.container.eventMode = "none";
                this.setIdleFacing("north");
                return;
            }

            this.summoning = false;
            this.setIdleFacing("south");
            this.postStayTimer = this.summonHoldPost
                ? NPC_CONFIG.stayTimeAfterSummonSeconds
                : 0;
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
        if (
            !this.inFilter ||
            this.hidden ||
            !this.wandering ||
            this.hovered ||
            this.dragging ||
            this.landing
        ) {
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
