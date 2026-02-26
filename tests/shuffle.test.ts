import { countInversions, isSolvable, generateSolvableBoard } from '../src/puzzle/shuffle';

describe('countInversions', () => {
  test('returns 0 for the solved board', () => {
    const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    expect(countInversions(tiles)).toBe(0);
  });

  test('returns 1 for a single inversion', () => {
    const tiles = [2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    expect(countInversions(tiles)).toBe(1);
  });

  test('ignores the blank tile', () => {
    // Blank at position 0; numbers 1-15 in order → 0 inversions
    const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    expect(countInversions(tiles)).toBe(0);
  });

  test('counts multiple inversions correctly', () => {
    // 15 before everything else → 14 inversions
    const tiles = [15, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0];
    expect(countInversions(tiles)).toBe(14);
  });
});

describe('isSolvable', () => {
  test('goal state is solvable', () => {
    const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    expect(isSolvable(tiles)).toBe(true);
  });

  test('swapping tiles 14 and 15 makes the goal unsolvable', () => {
    // 0 inversions → even; blank in row 4 from top → row 1 from bottom (odd) → need even inversions
    // One swap creates 1 inversion → odd → unsolvable
    const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14, 0];
    expect(isSolvable(tiles)).toBe(false);
  });

  test('a known solvable configuration returns true', () => {
    // blank at index 0 (row 4 from bottom = row 1 from bottom? No: row=0 from top → row 4 from bottom)
    // blankRowFromBottom = 4 - floor(0/4) = 4 - 0 = 4 → even → need odd inversions
    // [0,2,1,3,...] has 1 inversion (2 before 1) → odd → solvable
    const tiles = [0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    expect(isSolvable(tiles)).toBe(true);
  });
});

describe('generateSolvableBoard', () => {
  test('returns an array of length 16', () => {
    expect(generateSolvableBoard()).toHaveLength(16);
  });

  test('contains every number from 0 to 15 exactly once', () => {
    const board = generateSolvableBoard();
    const sorted = [...board].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  test('always generates a solvable board (100 iterations)', () => {
    for (let i = 0; i < 100; i++) {
      const board = generateSolvableBoard();
      expect(isSolvable(board)).toBe(true);
    }
  });

  test('does not always return the goal state (shuffles)', () => {
    const goal = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    // Extremely unlikely all 50 boards equal the goal
    const allGoal = Array.from({ length: 50 }, () =>
      generateSolvableBoard().every((t, i) => t === goal[i])
    ).every(Boolean);
    expect(allGoal).toBe(false);
  });
});
