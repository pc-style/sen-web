import { useGame } from '@/context/GameContext';
import { Button } from './ui/button';
import { Wand2 } from 'lucide-react';

export const GameActions = () => {
  const { state, broadcastAction, myPlayerId } = useGame();
  const { gamePhase, peekingState, drawnCard, gameMode, currentPlayerIndex } =
    state;

  const currentPlayer = state.players[currentPlayerIndex];
  const isMyTurn =
    gameMode === 'online' ? currentPlayer?.id === myPlayerId : true;
  const amICurrentPeeker =
    gamePhase === 'peeking' &&
    peekingState &&
    peekingState.playerIndex ===
      state.players.findIndex((p) => p.id === myPlayerId);

  const handleFinishPeeking = () => {
    if (peekingState?.peekedCount === 2) {
      broadcastAction({ type: 'FINISH_PEEKING' });
    }
  };

  const handlePobudka = () => {
    if (isMyTurn && gamePhase === 'playing') {
      broadcastAction({ type: 'CALL_POBUDKA' });
    }
  };

  const canUseSpecial = drawnCard?.isSpecial && gamePhase === 'holding_card';
  const mustSwap = Boolean(
    gamePhase === 'holding_card' && drawnCard && !drawnCard.isSpecial
  );

  if (
    (gameMode === 'hotseat' || amICurrentPeeker) &&
    gamePhase === 'peeking' &&
    peekingState &&
    peekingState.playerIndex ===
      state.players.findIndex(
        (p) => p.id === state.players[peekingState.playerIndex].id
      )
  ) {
    return (
      <Button
        onClick={handleFinishPeeking}
        disabled={peekingState?.peekedCount !== 2}
        className="min-h-[48px] w-auto min-w-[140px] text-base font-semibold sm:min-h-[52px] sm:min-w-[160px] sm:text-lg"
        size="lg"
      >
        Finish Peeking
      </Button>
    );
  }

  if (gamePhase === 'playing' && isMyTurn) {
    return (
      <div data-tutorial-id="pobudka-button">
        <Button
          onClick={handlePobudka}
          variant="destructive"
          className="min-h-[52px] w-auto min-w-[160px] text-lg font-bold shadow-lg hover:shadow-xl sm:min-h-[56px] sm:min-w-[180px] sm:text-xl"
          size="lg"
        >
          POBUDKA!
        </Button>
      </div>
    );
  }

  if (gamePhase === 'holding_card' && isMyTurn) {
    return (
      <div className="flex gap-2 sm:gap-3">
        <Button
          variant="outline"
          onClick={() => broadcastAction({ type: 'DISCARD_HELD_CARD' })}
          disabled={mustSwap}
          className="min-h-[48px] min-w-[100px] text-base sm:min-h-[52px] sm:min-w-[120px] sm:text-lg"
          size="lg"
        >
          Discard
        </Button>
        <Button
          onClick={() => broadcastAction({ type: 'USE_SPECIAL_ACTION' })}
          disabled={!canUseSpecial}
          className="min-h-[48px] min-w-[100px] text-base sm:min-h-[52px] sm:min-w-[120px] sm:text-lg"
          size="lg"
        >
          <Wand2 className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
          Action
        </Button>
      </div>
    );
  }

  return null;
};
