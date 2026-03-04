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
  test('tile adjacent to blank is valid', () => {
    expect(isValidMove(testTiles, 15)).toBe(true); // (3,3) same row
    expect(isValidMove(testTiles, 10)).toBe(true); // (2,2) same col
    expect(isValidMove(testTiles, 13)).toBe(true); // (3,1) same row
  });

  test('tile further than 1 away in same row is valid', () => {
    expect(isValidMove(testTiles, 12)).toBe(true); // (3,0) same row as blank
  });

  test('tile further than 1 away in same column is valid', () => {
    expect(isValidMove(testTiles, 2)).toBe(true);  // (0,2) same col as blank
    expect(isValidMove(testTiles, 6)).toBe(true);  // (1,2) same col as blank
  });

  test('moving the blank tile itself is invalid', () => {
    expect(isValidMove(testTiles, 14)).toBe(false);
  });

  test('tile not in same row or column as blank is invalid', () => {
    expect(isValidMove(testTiles, 0)).toBe(false);  // (0,0)
    expect(isValidMove(testTiles, 7)).toBe(false);  // (1,3)
    expect(isValidMove(testTiles, 11)).toBe(false); // (2,3)
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

// testTiles row 3: indices 12–15 → values [13, 14, 0, 15]
// testTiles col 2: indices 2,6,10,14 → values [3, 7, 11, 0]
describe('applyMove', () => {
  test('single adjacent tile slides correctly (row)', () => {
    // Click 15 at index 15 (right of blank) — only one tile moves
    const result = applyMove(testTiles, 15);
    expect(result[14]).toBe(15);
    expect(result[15]).toBe(0);
  });

  test('slides multiple tiles in a row (left of blank)', () => {
    // Click tile 13 at index 12 — blank at (3,2), tile at (3,0)
    // Tiles 13 and 14 shift right: row 3 becomes [_, 13, 14, 15]
    const result = applyMove(testTiles, 12);
    expect(result[12]).toBe(0);
    expect(result[13]).toBe(13);
    expect(result[14]).toBe(14);
    expect(result[15]).toBe(15); // unchanged
  });

  test('slides multiple tiles in a column (above blank)', () => {
    // Click tile 3 at index 2 (row 0, col 2) — blank at (3,2)
    // Tiles 3,7,11 shift down: col 2 becomes [_, 3, 7, 11]
    const result = applyMove(testTiles, 2);
    expect(result[2]).toBe(0);
    expect(result[6]).toBe(3);
    expect(result[10]).toBe(7);
    expect(result[14]).toBe(11);
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
