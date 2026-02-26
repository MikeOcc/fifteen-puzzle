export function isAdjacent(fromIndex: number, toIndex: number): boolean {
  const fromRow = Math.floor(fromIndex / 4);
  const fromCol = fromIndex % 4;
  const toRow = Math.floor(toIndex / 4);
  const toCol = toIndex % 4;

  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function isValidMove(tiles: number[], tileIndex: number): boolean {
  if (tileIndex < 0 || tileIndex > 15) return false;
  if (tiles[tileIndex] === 0) return false; // cannot move the blank

  const blankIndex = tiles.indexOf(0);
  return isAdjacent(tileIndex, blankIndex);
}

export function isSolved(tiles: number[]): boolean {
  const goal = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  return tiles.every((t, i) => t === goal[i]);
}

/** Returns a new array with the clicked tile and the blank swapped. */
export function applyMove(tiles: number[], tileIndex: number): number[] {
  const next = [...tiles];
  const blankIndex = next.indexOf(0);
  [next[tileIndex], next[blankIndex]] = [next[blankIndex], next[tileIndex]];
  return next;
}
