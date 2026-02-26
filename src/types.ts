export type Tiles = number[];

export interface SessionResponse {
  id: string;
  tiles: Tiles;
  moveCount: number;
  startedAt: string;
  finishedAt: string | null;
}

export interface MoveRequest {
  tileIndex: number;
}

export interface MoveResponse {
  tiles: Tiles;
  moveCount: number;
  finishedAt: string | null;
  valid: boolean;
}
