import React from 'react';
import { useGame } from '@/context/GameContext';
import { Player } from '@/types';
import { PlayerHand } from './PlayerHand';
import { GameCard } from './Card';
import { Button } from './ui/button';
import { Scoreboard } from './Scoreboard';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Copy, Menu, Users, Cloud, ScrollText } from 'lucide-react';
import { ActionModal } from './ActionModal';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { ChatBox } from './ChatBox';
import { GameActions } from './GameActions';
import { ScrollArea } from './ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';
import { getGameBackgroundAsset } from '@/lib/cardAssets';

export const Gameboard: React.FC = () => {
  const { state, myPlayerId, broadcastAction, playSound } = useGame();
  const {
    players,
    currentPlayerIndex,
    drawPile,
    discardPile,
    gamePhase,
    actionMessage,
    roomId,
    drawnCard,
    gameMode,
  } = state;

  if (players.length === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center font-heading">
        <p>Loading game...</p>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];

  // In hotseat mode, keep fixed positions: player[0] at bottom, player[1] at top
  // In online mode, show current user at bottom and opponent at top
  let bottomPlayer: Player;
  let topPlayer: Player | null;

  if (gameMode === 'hotseat') {
    bottomPlayer = players[0];
    topPlayer = players.length > 1 ? players[1] : null;
  } else {
    // Online mode: show my player at bottom
    bottomPlayer = players.find((p) => p.id === myPlayerId) || currentPlayer;
    topPlayer =
      players.length > 1
        ? players.find((p) => p.id !== bottomPlayer.id) || null
        : null;
  }

  const isMyTurn =
    gameMode === 'online' ? currentPlayer?.id === myPlayerId : true;

  const handleDrawFromDeck = () => {
    if (isMyTurn && gamePhase === 'playing') {
      broadcastAction({ type: 'DRAW_FROM_DECK' });
    }
  };

  const handleDrawFromDiscard = () => {
    if (isMyTurn && gamePhase === 'playing') {
      broadcastAction({ type: 'DRAW_FROM_DISCARD' });
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard!');
    }
  };

  const isPlayerActionable = isMyTurn && gamePhase === 'playing';

  const SidePanelContent = () => (
    <>
      <div className="my-4 min-h-[60px] rounded-lg border border-border/30 bg-accent/40 p-4 backdrop-blur-sm">
        <h4 className="mb-2 flex items-center gap-2 font-heading font-semibold text-foreground">
          <ScrollText className="h-4 w-4 text-primary" />
          Action Log
        </h4>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {actionMessage}
        </p>
      </div>

      <Separator className="my-4 bg-border/50" />
      <div data-tutorial-id="scoreboard">
        <Scoreboard players={players} />
      </div>
      {gameMode === 'online' && (
        <>
          <Separator className="my-4 bg-border/50" />
          <div className="h-64">
            <ChatBox />
          </div>
        </>
      )}
    </>
  );

  const backgroundImage = getGameBackgroundAsset();

  return (
    <div
      className="relative flex h-screen w-full flex-col gap-1 overflow-hidden bg-cover bg-center p-0.5 text-foreground sm:gap-2 sm:p-1 md:gap-3 md:p-2 lg:flex-row lg:p-3"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Light overlays for better readability on bright background */}
      <div className="pointer-events-none absolute inset-0 bg-white/40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/25" />

      <main className="relative z-10 flex min-h-0 flex-grow flex-col">
        {/* Top Player Area */}
        <div className="mb-2 flex flex-shrink-0 items-start justify-center sm:mb-3 md:mb-4">
          {topPlayer ? (
            <PlayerHand
              player={topPlayer}
              isCurrentPlayer={currentPlayer.id === topPlayer.id}
              isOpponent={true}
              playSound={playSound}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-purple-200/60 bg-purple-50/50">
              <p className="font-heading text-sm text-muted-foreground sm:text-base">
                Waiting for opponent...
              </p>
            </div>
          )}
        </div>

        {/* Center Area */}
        <div
          className="my-2 flex min-h-0 flex-grow items-center justify-center gap-3 sm:my-3 sm:gap-4 md:my-4 md:gap-6 lg:gap-8"
          data-tutorial-id="piles"
        >
          <div
            className="flex flex-col items-center"
            data-tutorial-id="draw-pile"
          >
            <GameCard
              card={null}
              isFaceUp={false}
              className={isPlayerActionable ? 'cursor-pointer' : ''}
              onClick={handleDrawFromDeck}
              isGlowing={isPlayerActionable}
              playSound={playSound}
            />
            <span className="mt-1 text-xs font-medium text-gray-700 sm:mt-1.5 sm:text-sm md:text-base">
              Draw ({drawPile.length})
            </span>
          </div>

          <AnimatePresence>
            {drawnCard && isMyTurn && gamePhase === 'holding_card' && (
              <motion.div
                className="flex flex-col items-center px-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-2 font-heading text-sm font-semibold text-purple-700 sm:text-base">
                  Your Card
                </p>
                <GameCard card={drawnCard} isFaceUp={true} isGlowing />
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="flex flex-col items-center"
            data-tutorial-id="discard-pile"
          >
            <GameCard
              card={
                discardPile.length > 0
                  ? discardPile[discardPile.length - 1]
                  : null
              }
              isFaceUp={true}
              className={isPlayerActionable ? 'cursor-pointer' : ''}
              onClick={handleDrawFromDiscard}
              isGlowing={isPlayerActionable && discardPile.length > 0}
              playSound={playSound}
            />
            <span className="mt-1 text-xs font-medium text-gray-700 sm:mt-1.5 sm:text-sm md:text-base">
              Discard
            </span>
          </div>
        </div>

        {/* Bottom Player Area */}
        {bottomPlayer && (
          <div className="mt-auto flex-shrink-0 pb-1 sm:pb-2">
            <div data-tutorial-id="player-hand">
              <PlayerHand
                player={bottomPlayer}
                isCurrentPlayer={currentPlayer.id === bottomPlayer.id}
                playSound={playSound}
              />
            </div>
            <div
              className="mt-1 flex h-8 justify-center sm:mt-2 sm:h-10 md:mt-3 md:h-12"
              data-tutorial-id="game-actions"
            >
              <GameActions />
            </div>
          </div>
        )}
      </main>

      {/* Side Panel - Desktop */}
      <aside className="relative z-10 hidden w-full flex-shrink-0 flex-col rounded-xl border border-border/40 bg-card/95 p-5 shadow-soft-lg backdrop-blur-lg lg:flex lg:w-80 lg:max-w-xs">
        <h2 className="mb-3 text-center font-heading text-3xl font-bold text-foreground">
          Sen
        </h2>
        {gameMode === 'online' && roomId && (
          <div className="mb-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Cloud className="h-4 w-4" />
            <span>{roomId}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={copyRoomId}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
        {gameMode === 'hotseat' && (
          <div className="mb-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Local Game</span>
          </div>
        )}
        <Separator />
        <SidePanelContent />
      </aside>

      {/* Side Panel Trigger - Mobile */}
      <div className="absolute right-2 top-2 z-20 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="border-border/40 bg-card/95 backdrop-blur-lg">
            <SheetHeader>
              <SheetTitle className="font-heading text-2xl">
                Game Menu
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100%-4rem)] pr-4">
              <SidePanelContent />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <ActionModal />
    </div>
  );
};
