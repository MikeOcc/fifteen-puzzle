export function isAdjacent(fromIndex: number, toIndex: number): boolean {
  const fromRow = Math.floor(fromIndex / 4);
  const fromCol = fromIndex % 4;
  const toRow = Math.floor(toIndex / 4);
  const toCol = toIndex % 4;

  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/** A move is valid when the clicked tile shares a row or column with the blank. */
export function isValidMove(tiles: number[], tileIndex: number): boolean {
  if (tileIndex < 0 || tileIndex > 15) return false;
  if (tiles[tileIndex] === 0) return false; // cannot move the blank

  const blankIndex = tiles.indexOf(0);
  const blankRow = Math.floor(blankIndex / 4);
  const blankCol = blankIndex % 4;
  const tileRow  = Math.floor(tileIndex / 4);
  const tileCol  = tileIndex % 4;

  return tileRow === blankRow || tileCol === blankCol;
}

export function isSolved(tiles: number[]): boolean {
  const goal = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  return tiles.every((t, i) => t === goal[i]);
}

/**
 * Slides all tiles between tileIndex and the blank toward the blank,
 * placing the blank where the clicked tile was.
 */
export function applyMove(tiles: number[], tileIndex: number): number[] {
  const result = [...tiles];
  const blankIndex = tiles.indexOf(0);
  const blankRow = Math.floor(blankIndex / 4);
  const blankCol = blankIndex % 4;
  const tileRow  = Math.floor(tileIndex / 4);
  const tileCol  = tileIndex % 4;

  if (tileRow === blankRow) {
    if (tileCol < blankCol) {
      // Clicked tile is left of blank — shift tiles rightward
      for (let col = blankCol; col > tileCol; col--) {
        result[tileRow * 4 + col] = result[tileRow * 4 + col - 1];
      }
    } else {
      // Clicked tile is right of blank — shift tiles leftward
      for (let col = blankCol; col < tileCol; col++) {
        result[tileRow * 4 + col] = result[tileRow * 4 + col + 1];
      }
    }
  } else {
    if (tileRow < blankRow) {
      // Clicked tile is above blank — shift tiles downward
      for (let row = blankRow; row > tileRow; row--) {
        result[row * 4 + tileCol] = result[(row - 1) * 4 + tileCol];
      }
    } else {
      // Clicked tile is below blank — shift tiles upward
      for (let row = blankRow; row < tileRow; row++) {
        result[row * 4 + tileCol] = result[(row + 1) * 4 + tileCol];
      }
    }
  }

  result[tileIndex] = 0;
  return result;
}
