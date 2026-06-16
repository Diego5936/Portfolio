export type FacingDirection = "north" | "south" | "east" | "west";
export type WalkFrame = 1 | 2;

export const FACING_DIRECTIONS: FacingDirection[] = [
    "north",
    "east",
    "south",
    "west",
];


export function directionFromDelta(dx: number, dy: number): FacingDirection {
    if (dx === 0 && dy === 0) {
        return "south";
    }

    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? "east" : "west";
    }

    return dy > 0 ? "south" : "north";
}

export function randomLookDirections(
    count: number,
    exclude?: FacingDirection,
) {
    const pool = exclude
        ? FACING_DIRECTIONS.filter((direction) => direction !== exclude)
        : [...FACING_DIRECTIONS];

    const picks: FacingDirection[] = [];

    while (picks.length < count && pool.length > 0) {
        const index = Math.floor(Math.random() * pool.length);
        picks.push(pool[index]);
        pool.splice(index, 1);
    }

    return picks;
}
