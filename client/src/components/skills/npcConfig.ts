export const NPC_CONFIG = {
    size: 37,
    labelFontSize: 11,
    labelGap: 11, // Gap between label bottom and npche ad
    headTopInsetRatio: 0.28, // Hood top as fraction of sprite height from image top
    lineupSpacing: 63, // Distance between NPCs at linup
    lineupRowGap: 58, // Distance between rows in lineup
    lineupRows: 3, // Fixed number of lineup rows
    lineupBottomOffset: 28, // Padding from botton

    // ---- Wondering Logic -----
    wanderDelaySeconds: 3, // Seconds to wait before NPCs can leave their post
    leaveChance: 0.25, // Chance to leave post each roll interval
    leaveRollIntervalSeconds: 2.5, // Seconds between roll intervals

    // Movement while wandering
    speedMin: 40,
    speedMax: 25,
    arriveDistance: 4, // Distance to consider arrived at target
    wanderPickAttempts: 20, // Random spots tried per target pick
    minNpcSeparation: 72, // Min center distance from other NPCs at destination (px)
    moveSeparationRadius: 55, // Light repulsion radius while walking (px)
    moveSeparationStrength: 0.4, // Blend of repulsion vs toward-target while walking

    // Pause at destination before picking a new target
    pauseMinSeconds: 3, // Minimum seconds to pause
    pauseMaxSeconds: 10, // Maximum seconds to pause

    // ---- Look Around Logic -----
    lookAroundChance: 0.5, // Chance to glance before choosing next action
    lookDirectionCountMin: 1, // Minimum random glances in a look sequence
    lookDirectionCountMax: 3, // Maximum random glances in a look sequence
    lookDirectionDurationSeconds: 1.5, // Seconds to hold each glance
    lookThenMoveChance: 0.5, // After looking, chance to walk instead of staying put
    preMoveLookDurationSeconds: 0.4, // Face travel direction before walking
    walkFrameDurationSeconds: 0.15, // Seconds per walk animation frame

    // ---- Hang / Drag Logic -----
    hangDragScale: 1.95, // Scale while lifted (simulates z-axis pull)
    hangLiftOffsetY: 10, // Sprite shifts up while scaled
    hangLandDurationSeconds: 0.6, // Time to scale back down on release
    hangHandLocalX: 1, // Hand X as fraction from center to right edge
    hangHandLocalY: 1, // Hand Y as fraction from center to top edge
    hangHandOffsetX: -7, // Fine-tune
    hangHandOffsetY: 2, // Fine-tune

    // ---- Summon Logic -----
    summonSpeed: 120, // Speed when walking back to post (px/s)
    stayTimeAfterSummonSeconds: 15, // Seconds to hold post after trumpet summon
    exitOffscreenY: -48, // Y target when running off the top of the panel
    reenterOffscreenY: -48, // Base Y when returning from off screen
    reenterStaggerMin: 0, // Extra px above reenterOffscreenY (random min)
    reenterStaggerMax: 100, // Extra px above reenterOffscreenY (random max)

    // ---- Trumpet / Lineup Sign -----
    trumpetSize: 105, // Trumpet display size in pixels
    lineupSignSize: 80, // Lineup sign display size in pixels
    // Bottom-right corner of each sprite, measured as px inset from the panel edges
    trumpetOffsetX: 16, // from right edge
    trumpetOffsetY: 16, // from bottom edge
    lineupSignOffsetX: 80, // from right edge (sign anchor is bottom-center)
    lineupSignOffsetY: -15, // from bottom edge
    lineupSignDelayAfterWanderSeconds: 3, // Extra seconds after wander/hold delay before sign appears
    uiExclusionMargin: 4, // Extra clearance around filter/trumpet UI zones
} as const;

export function getNpcLayoutKey() {
    return [
        NPC_CONFIG.size,
        NPC_CONFIG.labelFontSize,
        NPC_CONFIG.labelGap,
        NPC_CONFIG.headTopInsetRatio,
        NPC_CONFIG.lineupSpacing,
        NPC_CONFIG.lineupRowGap,
        NPC_CONFIG.lineupRows,
        NPC_CONFIG.lineupBottomOffset,
        NPC_CONFIG.trumpetSize,
        NPC_CONFIG.lineupSignSize,
        NPC_CONFIG.trumpetOffsetX,
        NPC_CONFIG.trumpetOffsetY,
        NPC_CONFIG.lineupSignOffsetX,
        NPC_CONFIG.lineupSignOffsetY,
    ].join("|");
}
