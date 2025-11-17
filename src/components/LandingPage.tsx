import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface LandingPageProps {
  onEnter: () => void;
}

const Crow = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    fill="currentColor"
  >
    <path d="M123.5,62.1c-2.4-1.2-4.9-1.8-7.5-1.8c-7.9,0-15,6.3-16.1,14.2c-1.3,9.5,4.6,18.1,13.2,19.5c0.8,0.1,1.5,0.2,2.3,0.2c6.9,0,13.1-4.7,15.2-11.5C132.8,75.1,129.8,66.4,123.5,62.1z M52.9,138.1c-1.9,0-3.8-0.5-5.5-1.5c-5.5-3.2-8.4-9.6-6.5-15.6l16.3-51.2c1.9-6,7.8-9.9,13.8-8.6c6,1.3,9.9,7.1,8.6,13.2l-16.3,51.2C62.1,133.5,57.7,138.1,52.9,138.1z M145.2,120.3c-2.9,0-5.7-1.1-7.8-3.3c-4.2-4.2-4.2-11,0-15.2c4.2-4.2,11-4.2,15.2,0c4.2,4.2,4.2,11,0,15.2C150.9,119.2,148.1,120.3,145.2,120.3z" />
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const title = 'Sen';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8">
      {/* Background elements - bright, fun gradients */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-cyan-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      <motion.div className="absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 animate-float rounded-full bg-gradient-to-br from-purple-200/60 to-pink-200/60 blur-3xl" />
      <motion.div
        className="absolute -right-1/4 -top-1/4 h-1/2 w-1/2 animate-float rounded-full bg-gradient-to-br from-cyan-200/60 to-blue-200/60 blur-3xl"
        style={{ animationDelay: '-3s' }}
      />

      {/* Flying Crows - darker for visibility on light background */}
      <Crow
        className="absolute -left-[10%] top-[10%] h-16 w-16 animate-fly-across text-purple-900/20 sm:h-20 sm:w-20 md:h-24 md:w-24"
        style={{ animationDelay: '-2s', animationDuration: '25s' }}
      />
      <Crow
        className="absolute -left-[10%] top-[50%] h-12 w-12 animate-fly-across text-purple-800/15 sm:h-14 sm:w-14 md:h-16 md:w-16"
        style={{ animationDelay: '0s', animationDuration: '18s' }}
      />
      <Crow
        className="absolute -left-[10%] top-[80%] h-20 w-20 animate-fly-across text-purple-900/20 sm:h-24 sm:w-24 md:h-32 md:w-32"
        style={{ animationDelay: '-10s', animationDuration: '30s' }}
      />

      <motion.div
        className="z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="flex overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 bg-clip-text font-heading text-6xl font-bold text-transparent sm:text-7xl md:text-8xl lg:text-9xl"
          aria-label={title}
        >
          {title.split('').map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="mt-3 text-base font-medium text-gray-700 sm:mt-4 sm:text-lg md:text-xl"
          variants={itemVariants}
        >
          A game of dreams and crows.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-8 sm:mt-10 md:mt-12">
          <Button
            onClick={onEnter}
            size="lg"
            className="hover:shadow-dreamy px-6 py-5 text-base font-semibold shadow-soft-lg transition-all duration-300 hover:scale-105 active:scale-95 sm:px-8 sm:py-6 sm:text-lg"
          >
            Enter the Dream
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
