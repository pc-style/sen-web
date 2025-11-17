import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/types';
import { cn } from '@/lib/utils';
import { getCardAsset, getCardBackAsset } from '@/lib/cardAssets';
import { SoundType } from '@/hooks/use-sounds';

interface CardProps {
  card: CardType | null;
  isFaceUp: boolean;
  onClick?: () => void;
  className?: string;
  hasBeenPeeked?: boolean; // show a tiny, persistent glow to indicate "I have seen this"
  isGlowing?: boolean; // external glow hint (e.g., legal to click)
  playSound?: (sound: SoundType) => void;
}

export const GameCard: React.FC<CardProps> = ({
  card,
  isFaceUp,
  onClick,
  className,
  hasBeenPeeked,
  isGlowing,
  playSound,
}) => {
  // Detect "reveal moment" to flash special glow only when a special card turns face-up
  const prevFaceUp = useRef<boolean>(isFaceUp);
  const [justRevealed, setJustRevealed] = useState(false);

  useEffect(() => {
    if (!prevFaceUp.current && isFaceUp) {
      // flipped from face-down to face-up
      setJustRevealed(true);
      const t = setTimeout(() => setJustRevealed(false), 900);
      return () => clearTimeout(t);
    }
    prevFaceUp.current = isFaceUp;
  }, [isFaceUp]);

  const cardVariants = {
    faceUp: { rotateY: 180 },
    faceDown: { rotateY: 0 },
  };

  const handleClick = () => {
    if (onClick) {
      if (playSound) playSound('flip');
      onClick();
    }
  };

  const frontAsset = getCardAsset(card);
  const backAsset = getCardBackAsset();
  const actionLabel = card?.isSpecial
    ? card.specialAction === 'peek_1'
      ? 'Peek 1'
      : card.specialAction === 'take_2'
        ? 'Take 2'
        : 'Swap 2'
    : null;

  // Compose subtle glow styles:
  // - hasBeenPeeked: tiny, persistent glow indicating "I've seen this card"
  // - justRevealed + special: brief stronger glow only at reveal moment
  // - isGlowing: optional external hint (e.g., legal action)
  const peekGlow = hasBeenPeeked
    ? 'shadow-[0_0_10px_rgba(168,85,247,0.22)]'
    : '';
  const specialRevealGlow =
    isFaceUp && justRevealed && card?.isSpecial
      ? 'shadow-[0_0_28px_rgba(168,85,247,0.55)]'
      : '';
  const externalGlow = isGlowing
    ? 'shadow-[0_0_18px_rgba(147,51,234,0.32)]'
    : '';

  // No rings at all. Rounded, image edge-to-edge. Soft depth shadow only.
  const outerClasses = cn(
    'group w-[18vw] max-w-24 sm:w-[15vw] sm:max-w-28 md:w-[10vw] md:max-w-32 lg:w-[8vw] lg:max-w-36 aspect-[2/3] perspective-1000 rounded-xl overflow-hidden',
    (isGlowing || justRevealed) && isFaceUp ? 'shadow-soft' : '',
    peekGlow,
    specialRevealGlow,
    externalGlow,
    className
  );

  return (
    <motion.div className={outerClasses} onClick={handleClick}>
      <motion.div
        className="transform-style-3d relative h-full w-full"
        variants={cardVariants}
        animate={isFaceUp ? 'faceUp' : 'faceDown'}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        {/* Card Back */}
        <div className="backface-hidden absolute h-full w-full">
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-transparent">
            <img
              src={backAsset}
              alt="Card Back"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        {/* Card Front */}
        <div className="backface-hidden transform-rotate-y-180 absolute h-full w-full">
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-transparent">
            {card ? (
              <>
                {/* Full image */}
                <img
                  src={frontAsset}
                  alt={`Card ${card.isSpecial ? card.specialAction : card.value}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />

                {/* Minimalistic number label (top-right), only when revealed */}
                {isFaceUp && (
                  <div className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3 md:right-3 md:top-3">
                    <span
                      className={cn(
                        'inline-block font-heading text-xs font-bold sm:text-sm',
                        card?.isSpecial ? 'text-purple-200' : 'text-white'
                      )}
                    >
                      {card.value}
                    </span>
                  </div>
                )}

                {/* Full-size hover overlay for revealed cards (does not scale or animate the card) */}
                {isFaceUp && (
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="px-3 text-center font-heading text-base font-bold text-white drop-shadow sm:text-lg md:text-xl">
                        <div>{card.value}</div>
                        {actionLabel && (
                          <div className="mt-1 text-xs font-medium opacity-90 sm:text-sm">
                            {actionLabel}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-xl ring-0 ring-white/30 md:ring-1" />
                  </div>
                )}
              </>
            ) : (
              <img
                src={backAsset}
                alt="Card Back"
                className="h-full w-full object-cover"
                draggable={false}
              />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
