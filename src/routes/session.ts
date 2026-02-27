import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { generateSolvableBoard } from '../puzzle/shuffle';
import { isValidMove, isSolved, applyMove } from '../puzzle/validate';
import { SessionResponse, MoveResponse } from '../types';

const router = Router();

// POST /api/session — create a new game session
router.post('/', async (req: Request, res: Response) => {
  try {
    const tiles = generateSolvableBoard();
    const session = await prisma.gameSession.create({
      data: {
        state: {
          create: {
            tiles,
            moveCount: 0,
            startedAt: new Date(),
          },
        },
      },
      include: { state: true },
    });

    const state = session.state!;
    const response: SessionResponse = {
      id: session.id,
      tiles: state.tiles as number[],
      moveCount: state.moveCount,
      startedAt: state.startedAt.toISOString(),
      finishedAt: state.finishedAt?.toISOString() ?? null,
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/session/stats — best (minimum) move count across all finished games
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await prisma.gameState.aggregate({
      where: { finishedAt: { not: null } },
      _min: { moveCount: true },
    });
    res.json({ bestMoves: result._min.moveCount ?? null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/session/:id — fetch current board + stats
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const session = await prisma.gameSession.findUnique({
      where: { id: req.params.id },
      include: { state: true },
    });

    if (!session || !session.state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const state = session.state;
    const response: SessionResponse = {
      id: session.id,
      tiles: state.tiles as number[],
      moveCount: state.moveCount,
      startedAt: state.startedAt.toISOString(),
      finishedAt: state.finishedAt?.toISOString() ?? null,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// POST /api/session/:id/move — attempt a move
const MoveSchema = z.object({
  tileIndex: z.number().int().min(0).max(15),
});

router.post('/:id/move', async (req: Request, res: Response) => {
  try {
    const parsed = MoveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: 'Invalid request body', details: parsed.error.issues });
    }

    const { tileIndex } = parsed.data;

    const session = await prisma.gameSession.findUnique({
      where: { id: req.params.id },
      include: { state: true },
    });

    if (!session || !session.state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.state.finishedAt) {
      return res.status(400).json({ error: 'Game already finished' });
    }

    const tiles = session.state.tiles as number[];

    if (!isValidMove(tiles, tileIndex)) {
      return res.status(400).json({ error: 'Invalid move', valid: false });
    }

    const blankIndex = tiles.indexOf(0);
    const tileNumber = tiles[tileIndex];
    const newTiles = applyMove(tiles, tileIndex);
    const solved = isSolved(newTiles);

    const [updatedState] = await prisma.$transaction([
      prisma.gameState.update({
        where: { sessionId: session.id },
        data: {
          tiles: newTiles,
          moveCount: { increment: 1 },
          ...(solved ? { finishedAt: new Date() } : {}),
        },
      }),
      prisma.move.create({
        data: {
          sessionId: session.id,
          fromIndex: tileIndex,
          toIndex: blankIndex,
          tileNumber,
        },
      }),
    ]);

    const response: MoveResponse = {
      tiles: updatedState.tiles as number[],
      moveCount: updatedState.moveCount,
      finishedAt: updatedState.finishedAt?.toISOString() ?? null,
      valid: true,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process move' });
  }
});

// POST /api/session/:id/reset — reshuffle to a new solvable board
router.post('/:id/reset', async (req: Request, res: Response) => {
  try {
    const session = await prisma.gameSession.findUnique({
      where: { id: req.params.id },
      include: { state: true },
    });

    if (!session || !session.state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const tiles = generateSolvableBoard();
    const updatedState = await prisma.gameState.update({
      where: { sessionId: session.id },
      data: {
        tiles,
        moveCount: 0,
        startedAt: new Date(),
        finishedAt: null,
      },
    });

    const response: SessionResponse = {
      id: session.id,
      tiles: updatedState.tiles as number[],
      moveCount: updatedState.moveCount,
      startedAt: updatedState.startedAt.toISOString(),
      finishedAt: null,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset session' });
  }
});

export default router;
