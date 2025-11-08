
import React from 'react';

interface OrbProps {
  isAnimating: boolean;
}

export const Orb: React.FC<OrbProps> = ({ isAnimating }) => {
  const animationName = isAnimating ? 'pulse-fast' : 'pulse-curious';
  const animationDuration = isAnimating ? '1.5s' : '4s';
  const gradient = `linear-gradient(to bottom right, var(--orb-gradient-from), var(--orb-gradient-via), var(--orb-gradient-to))`;

  return (
    <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
      <style>
        {`
          @keyframes pulse-curious {
            0%, 100% { transform: scale(0.95); }
            50% { transform: scale(1); }
          }
          @keyframes pulse-fast {
            0%, 100% { transform: scale(0.98); }
            50% { transform: scale(1.02); }
          }
          @keyframes glow-curious {
            0%, 100% { opacity: 0.2; transform: scale(1.2); }
            50% { opacity: 0.5; transform: scale(1.3); }
          }
          @keyframes glow-fast {
            0%, 100% { opacity: 0.4; transform: scale(1.25); }
            50% { opacity: 0.7; transform: scale(1.4); }
          }
        `}
      </style>
      <div
        className="absolute w-full h-full rounded-full"
        style={{
          backgroundImage: gradient,
          filter: 'blur(30px)',
          animation: `${isAnimating ? 'glow-fast' : 'glow-curious'} ${animationDuration} infinite ease-in-out`,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      ></div>
      <div
        className={`absolute w-full h-full rounded-full`}
        style={{ 
          animation: `${animationName} ${animationDuration} infinite ease-in-out`,
          backgroundImage: gradient,
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      ></div>
    </div>
  );
};