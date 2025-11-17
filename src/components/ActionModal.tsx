import React from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { GameCard } from './Card';
import { Card as CardType } from '@/types';

export const ActionModal: React.FC = () => {
  const { state, broadcastAction } = useGame();
  const { gamePhase, tempCards, lastRoundScores, gameWinnerName, players } =
    state;

  const handleTake2Choose = (card: CardType) => {
    broadcastAction({ type: 'ACTION_TAKE_2_CHOOSE', payload: { card } });
  };

  const handleNewRound = () => {
    broadcastAction({ type: 'START_NEW_ROUND' });
  };

  const renderTake2Content = () => (
    <>
      <DialogHeader className="space-y-2 sm:space-y-3">
        <DialogTitle className="text-center font-heading text-xl sm:text-2xl md:text-3xl">
          Take 2
        </DialogTitle>
        <DialogDescription className="text-center text-sm sm:text-base">
          You drew two cards. Choose one to keep. The other will be discarded.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap justify-center gap-4 py-4 sm:gap-6 sm:py-6 md:gap-8">
        {tempCards?.map((card) => (
          <div key={card.id} className="flex flex-col items-center gap-3">
            <GameCard card={card} isFaceUp={true} />
            <Button
              onClick={() => handleTake2Choose(card)}
              className="min-h-[48px] min-w-[100px] text-base font-semibold"
              size="lg"
            >
              Choose
            </Button>
          </div>
        ))}
      </div>
    </>
  );

  const renderRoundEndContent = () => (
    <>
      <DialogHeader className="space-y-2 sm:space-y-3">
        <DialogTitle className="text-center font-heading text-xl sm:text-2xl md:text-3xl">
          Round Over!
        </DialogTitle>
        <DialogDescription className="text-center text-sm sm:text-base">
          {state.actionMessage}
        </DialogDescription>
      </DialogHeader>
      <div className="py-3 sm:py-4 md:py-6">
        <ul className="space-y-3 rounded-lg bg-accent/30 p-3 sm:space-y-4 sm:p-4">
          {lastRoundScores?.map(({ playerId, score, penalty }) => {
            const player = players.find((p) => p.id === playerId);
            return (
              <li
                key={playerId}
                className="flex items-center justify-between border-b border-border/30 py-2 text-sm last:border-0 sm:text-base"
              >
                <span className="font-medium">{player?.name}</span>
                <span className="font-mono text-sm sm:text-base">
                  {score}{' '}
                  {penalty > 0 && (
                    <span className="font-semibold text-destructive">
                      + {penalty}
                    </span>
                  )}{' '}
                  <span className="font-bold">= {score + penalty}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <Button
        onClick={handleNewRound}
        className="min-h-[52px] w-full text-base font-semibold sm:text-lg"
        size="lg"
      >
        Start Next Round
      </Button>
    </>
  );

  const renderGameOverContent = () => (
    <>
      <DialogHeader className="space-y-2 sm:space-y-3">
        <DialogTitle className="bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-center font-heading text-2xl text-transparent sm:text-3xl md:text-4xl">
          Game Over!
        </DialogTitle>
        <DialogDescription className="text-center text-base font-semibold sm:text-lg">
          🎉 {gameWinnerName} wins the game! 🎉
        </DialogDescription>
      </DialogHeader>
      <div className="py-3 sm:py-4 md:py-6">
        <h4 className="mb-3 text-center font-heading text-base font-bold sm:mb-4 sm:text-lg">
          Final Scores
        </h4>
        <ul className="space-y-3 rounded-lg border-2 border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:space-y-4 sm:p-4">
          {players
            .sort((a, b) => a.score - b.score)
            .map((player, index) => (
              <li
                key={player.id}
                className="flex items-center justify-between border-b border-purple-200/30 py-2 text-sm last:border-0 sm:text-base"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : ''}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </span>
                <span className="font-mono text-base font-bold sm:text-lg">
                  {player.score}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </>
  );

  const isOpen =
    gamePhase === 'action_take_2' ||
    gamePhase === 'round_end' ||
    gamePhase === 'game_over';

  return (
    <Dialog open={isOpen}>
      <DialogContent className="shadow-dreamy max-w-[calc(100vw-2rem)] border-2 border-purple-100/50 bg-white/95 backdrop-blur-lg sm:max-w-md md:max-w-lg">
        {gamePhase === 'action_take_2' && renderTake2Content()}
        {gamePhase === 'round_end' && renderRoundEndContent()}
        {gamePhase === 'game_over' && renderGameOverContent()}
      </DialogContent>
    </Dialog>
  );
};
