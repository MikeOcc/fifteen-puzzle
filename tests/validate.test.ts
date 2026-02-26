import { isAdjacent, isValidMove, isSolved, applyMove } from '../src/puzzle/validate';

describe('isAdjacent', () => {
  test('horizontal neighbors are adjacent', () => {
    expect(isAdjacent(0, 1)).toBe(true);  // (0,0)↔(0,1)
    expect(isAdjacent(5, 6)).toBe(true);  // (1,1)↔(1,2)
  });

  test('vertical neighbors are adjacent', () => {
    expect(isAdjacent(0, 4)).toBe(true);  // (0,0)↔(1,0)
    expect(isAdjacent(5, 9)).toBe(true);  // (1,1)↔(2,1)
  });

  test('diagonal tiles are not adjacent', () => {
    expect(isAdjacent(0, 5)).toBe(false); // (0,0)↔(1,1)
    expect(isAdjacent(6, 9)).toBe(false); // (1,2)↔(2,1)
  });

  test('tiles in same row but more than 1 apart are not adjacent', () => {
    expect(isAdjacent(0, 2)).toBe(false);
    expect(isAdjacent(0, 3)).toBe(false);
  });

  test('wrap-across-row tiles are not adjacent', () => {
    // index 3 is (0,3) and index 4 is (1,0) — different row AND different col
    expect(isAdjacent(3, 4)).toBe(false);
    expect(isAdjacent(7, 8)).toBe(false);
  });
});

// Board used in several tests below:
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15]
//  blank at index 14 (row 3, col 2)
const testTiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15];

describe('isValidMove', () => {
  test('tile adjacent to blank is a valid move', () => {
    expect(isValidMove(testTiles, 15)).toBe(true); // (3,3) → blank at (3,2)
    expect(isValidMove(testTiles, 10)).toBe(true); // (2,2) → blank at (3,2)
    expect(isValidMove(testTiles, 13)).toBe(true); // (3,1) → blank at (3,2)
  });

  test('moving the blank tile itself is invalid', () => {
    expect(isValidMove(testTiles, 14)).toBe(false);
  });

  test('non-adjacent tile is invalid', () => {
    expect(isValidMove(testTiles, 0)).toBe(false);
    expect(isValidMove(testTiles, 7)).toBe(false);
  });

  test('out-of-bounds index is invalid', () => {
    expect(isValidMove(testTiles, -1)).toBe(false);
    expect(isValidMove(testTiles, 16)).toBe(false);
  });
});

describe('isSolved', () => {
  test('goal state returns true', () => {
    const solved = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    expect(isSolved(solved)).toBe(true);
  });

  test('any other arrangement returns false', () => {
    expect(isSolved(testTiles)).toBe(false);
    const almostSolved = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15];
    expect(isSolved(almostSolved)).toBe(false);
  });
});

describe('applyMove', () => {
  test('swaps the clicked tile with the blank', () => {
    // blank at 14, click tile at 15
    const result = applyMove(testTiles, 15);
    expect(result[14]).toBe(15);
    expect(result[15]).toBe(0);
  });

  test('all other tiles remain unchanged', () => {
    const result = applyMove(testTiles, 15);
    for (let i = 0; i < 14; i++) {
      expect(result[i]).toBe(testTiles[i]);
    }
  });

  test('does not mutate the original array', () => {
    const copy = [...testTiles];
    applyMove(testTiles, 15);
    expect(testTiles).toEqual(copy);
  });

  test('completing the last move produces the goal state', () => {
    const almostSolved = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15];
    const result = applyMove(almostSolved, 15);
    expect(isSolved(result)).toBe(true);
  });
});
