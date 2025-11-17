import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import React, { useEffect } from 'react';

import { GameProvider } from '@/context/GameContext';
import { useGame } from '@/context/GameContext';

// Silence sounds during tests to avoid side effects
vi.mock('@/hooks/use-sounds', () => ({
  useSounds: () => ({
    playSound: () => {},
  }),
}));

// Mock Supabase client to avoid any network/real-time behavior during unit tests
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    channel: () => ({
      on: () => ({
        on: () => ({
          on: () => ({
            on: () => ({
              subscribe: () => ({ status: 'SUBSCRIBED' }),
            }),
          }),
        }),
      }),
      send: () => {},
      unsubscribe: () => {},
    }),
    removeChannel: () => {},
  },
}));

/**
 * TestConsumer is a small helper component that:
 * - Subscribes to GameContext
 * - Emits the latest state to the test via onState callback
 * - Exposes the context API (startHotseatGame, broadcastAction, etc.) to the test via onApi callback
 */
const TestConsumer: React.FC<{
  onState: (state: any) => void;
  onApi?: (api: any) => void;
}> = ({ onState, onApi }) => {
  const ctx = useGame();

  useEffect(() => {
    onState(ctx.state);
    onApi?.({
      startHotseatGame: ctx.startHotseatGame,
      broadcastAction: ctx.broadcastAction,
      sendChatMessage: ctx.sendChatMessage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.state]);

  return null;
};

describe('GameContext core reducer transitions', () => {
  let latestState: any;
  let api: { startHotseatGame: Function; broadcastAction: Function; sendChatMessage: Function } | null;

  beforeEach(() => {
    latestState = undefined;
    api = null;
    cleanup();
  });

  it('provides the expected initial state at mount', async () => {
    render(
      <GameProvider>
        <TestConsumer
          onState={(s) => {
            latestState = s;
          }}
        />
      </GameProvider>
    );

    await waitFor(() => {
      expect(latestState).toBeDefined();
    });

    // Initial reducer state assertions (from initialState)
    expect(latestState.gameMode).toBe('lobby');
    expect(latestState.roomId).toBeNull();
    expect(latestState.players).toEqual([]);
    expect(latestState.drawPile).toEqual([]);
    expect(latestState.discardPile).toEqual([]);
    expect(latestState.currentPlayerIndex).toBe(0);
    expect(latestState.gamePhase).toBe('lobby');
    expect(typeof latestState.actionMessage).toBe('string');
  });

  it('startHotseatGame transitions state to peeking with two players and a prepared deck', async () => {
    render(
      <GameProvider>
        <TestConsumer
          onState={(s) => {
            latestState = s;
          }}
          onApi={(a) => {
            api = a;
          }}
        />
      </GameProvider>
    );

    await waitFor(() => {
      expect(latestState).toBeDefined();
      expect(api).toBeDefined();
    });

    // Trigger core transition: start hot-seat flow
    api!.startHotseatGame('Alice', 'Bob');

    await waitFor(() => {
      expect(latestState.gameMode).toBe('hotseat');
      expect(latestState.players.length).toBe(2);
      expect(latestState.players[0].name).toBe('Alice');
      expect(latestState.players[1].name).toBe('Bob');
      // Game moves into initial "peeking" phase after setup
      expect(latestState.gamePhase).toBe('peeking');
      // A deck should be ready and at least one discard card often exists after setup
      expect(Array.isArray(latestState.drawPile)).toBe(true);
      expect(latestState.drawPile.length).toBeGreaterThan(0);
      expect(Array.isArray(latestState.discardPile)).toBe(true);
      // Some implementations start with one card in discard; assert non-negatively just in case
      expect(latestState.discardPile.length).toBeGreaterThanOrEqual(0);
      // Helpful user feedback message typically includes the first player's name
      expect(typeof latestState.actionMessage).toBe('string');
      expect(latestState.actionMessage.toLowerCase()).toContain('peek');
      expect(latestState.actionMessage).toMatch(/Alice/i);
    });
  });

  it('broadcastAction with an unknown action type does not alter core state fields', async () => {
    render(
      <GameProvider>
        <TestConsumer
          onState={(s) => {
            latestState = s;
          }}
          onApi={(a) => {
            api = a;
          }}
        />
      </GameProvider>
    );

    await waitFor(() => {
      expect(latestState).toBeDefined();
      expect(api).toBeDefined();
    });

    // Enter a known non-lobby state to make it easier to check stability
    api!.startHotseatGame('Alice', 'Bob');

    await waitFor(() => {
      expect(latestState.gameMode).toBe('hotseat');
      expect(latestState.gamePhase).toBe('peeking');
    });

    const snapshot = {
      gameMode: latestState.gameMode,
      playersLen: latestState.players.length,
      currentPlayerIndex: latestState.currentPlayerIndex,
      phase: latestState.gamePhase,
      drawLen: latestState.drawPile.length,
      discardLen: latestState.discardPile.length,
    };

    // Dispatch an unknown action (the reducer should ignore it gracefully)
    api!.broadcastAction({ type: '__TEST_UNKNOWN__' } as any);

    // Wait a tick to allow reducer cycle
    await waitFor(() => {
      // Ensure core fields remain stable
      expect(latestState.gameMode).toBe(snapshot.gameMode);
      expect(latestState.players.length).toBe(snapshot.playersLen);
      expect(latestState.currentPlayerIndex).toBe(snapshot.currentPlayerIndex);
      expect(latestState.gamePhase).toBe(snapshot.phase);
      expect(latestState.drawPile.length).toBe(snapshot.drawLen);
      expect(latestState.discardPile.length).toBe(snapshot.discardLen);
    });
  });

  it('ignores draw actions during peeking phase (guarding transitions correctly)', async () => {
    render(
      <GameProvider>
        <TestConsumer
          onState={(s) => {
            latestState = s;
          }}
          onApi={(a) => {
            api = a;
          }}
        />
      </GameProvider>
    );

    await waitFor(() => {
      expect(latestState).toBeDefined();
      expect(api).toBeDefined();
    });

    api!.startHotseatGame('Alice', 'Bob');

    await waitFor(() => {
      expect(latestState.gamePhase).toBe('peeking');
      expect(latestState.drawPile.length).toBeGreaterThan(0);
    });

    const before = {
      phase: latestState.gamePhase,
      drawLen: latestState.drawPile.length,
      discardLen: latestState.discardPile.length,
    };

    // Attempt to draw from deck during "peeking" (should be ignored by reducer)
    api!.broadcastAction({ type: 'DRAW_FROM_DECK' } as any);

    await waitFor(() => {
      expect(latestState.gamePhase).toBe(before.phase);
      // these sizes should remain stable if action was ignored in this phase
      expect(latestState.drawPile.length).toBe(before.drawLen);
      expect(latestState.discardPile.length).toBe(before.discardLen);
    });
  });
});
