export const NPC_CONFIG = {
    size: 75,
    labelFontSize: 10, // Label font size in pixels
    labelGap: 4, // Pixels between label bottom and visual head top
    headTopInsetRatio: 0.28, // Hood top as fraction of sprite height from image top
    lineupSpacing: 65, // Distance between NPCs at linup
    lineupRowGap: 60, // Distance between rows in lineup
    lineupBottomOffset: 28, // Padding from botton

    // ---- Wondering Logic -----
    wanderDelaySeconds: 3, // Seconds to wait before NPCs can leave their post
    leaveChance: 0.25, // Chance to leave post each roll interval
    leaveRollIntervalSeconds: 2.5, // Seconds between roll intervals

    // Movement while wandering
    speedMin: 40,
    speedMax: 25,
    arriveDistance: 4, // Distance to consider arrived at target
    wanderMaxDistance: 100, // Furthest a target can be from current position (px)
    wanderTargetCandidates: 4, // Random spots considered each time a target is picked

    // Pause at destination before picking a new target
    pauseMinSeconds: 2, // Minimum seconds to pause
    pauseMaxSeconds: 5, // Maximum seconds to pause

    // ---- Summon Logic -----
    summonSpeed: 120, // Speed when walking back to post (px/s)
    stayTimeAfterSummonSeconds: 15, // Seconds to hold post after trumpet summon
    trumpetSize: 56, // Trumpet button size in pixels
    trumpetPadding: 16, // Padding from bottom-right corner
} as const;

export function getNpcLayoutKey() {
    return [
        NPC_CONFIG.size,
        NPC_CONFIG.labelFontSize,
        NPC_CONFIG.labelGap,
        NPC_CONFIG.headTopInsetRatio,
    ].join("|");
}
