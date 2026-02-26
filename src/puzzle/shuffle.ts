/**
 * Count inversions in the tile array (pairs i<j where tiles[i] > tiles[j]),
 * ignoring the blank tile (0).
 */
export function countInversions(tiles: number[]): number {
  const nums = tiles.filter((t) => t !== 0);
  let inversions = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) inversions++;
    }
  }
  return inversions;
}

/**
 * For a 4x4 grid a position is solvable when:
 *   - blank on an even row from bottom → inversions must be odd
 *   - blank on an odd row from bottom  → inversions must be even
 */
export function isSolvable(tiles: number[]): boolean {
  const blankIndex = tiles.indexOf(0);
  const blankRowFromBottom = 4 - Math.floor(blankIndex / 4); // 1-indexed
  const inversions = countInversions(tiles);

  if (blankRowFromBottom % 2 === 0) {
    return inversions % 2 === 1;
  } else {
    return inversions % 2 === 0;
  }
}

/**
 * Fisher-Yates shuffle; if the result is unsolvable, swap the first two
 * non-blank tiles to flip parity by exactly 1 inversion.
 */
export function generateSolvableBoard(): number[] {
  const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  if (!isSolvable(tiles)) {
    // Swap the first two non-blank tiles to flip the inversion parity
    let first = -1;
    let second = -1;
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] !== 0) {
        if (first === -1) {
          first = i;
        } else {
          second = i;
          break;
        }
      }
    }
    [tiles[first], tiles[second]] = [tiles[second], tiles[first]];
  }

  return tiles;
}
