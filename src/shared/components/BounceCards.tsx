import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BounceCardsProps {
  className?: string;
  images?: string[];
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  transformStyles?: string[];
  enableHover?: boolean;
}

export default function BounceCards({
  className = '',
  images = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  transformStyles = [
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)',
  ],
  enableHover = false,
}: BounceCardsProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const getNoRotationTransform = (transformStr: string): string => {
    return transformStr.replace(/rotate\([^)]*\)/, 'rotate(0deg)');
  };

  const getPushedTransform = (
    baseTransform: string,
    offsetX: number
  ): string => {
    const match = baseTransform.match(/translate\(([-0-9.]+)px\)/);
    if (match) {
      const newX = parseFloat(match[1]) + offsetX;
      return baseTransform.replace(
        /translate\([-0-9.]+px\)/,
        `translate(${newX}px)`
      );
    }
    return `${baseTransform} translate(${offsetX}px)`;
  };

  const getTransform = (idx: number): string => {
    const base = transformStyles[idx] || 'none';
    if (!enableHover || hoveredIdx === null) return base;
    if (idx === hoveredIdx) return getNoRotationTransform(base);
    const offsetX = idx < hoveredIdx ? -160 : 160;
    return getPushedTransform(base, offsetX);
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {images.map((src, idx) => (
        <motion.div
          key={idx}
          className="absolute w-[260px] aspect-square border-8 border-white rounded-[30px] overflow-hidden"
          style={{
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          }}
          initial={{ scale: 0, transform: transformStyles[idx] || 'none' }}
          animate={{
            scale: 1,
            transform: getTransform(idx),
          }}
          transition={{
            scale: {
              delay: animationDelay + idx * animationStagger,
              type: 'spring',
              stiffness: 260,
              damping: 15,
            },
            transform: {
              type: 'spring',
              stiffness: 200,
              damping: 20,
            },
          }}
          onMouseEnter={() => enableHover && setHoveredIdx(idx)}
          onMouseLeave={() => enableHover && setHoveredIdx(null)}
        >
          <img
            className="w-full h-full object-cover"
            src={src}
            alt={`card-${idx}`}
          />
        </motion.div>
      ))}
    </div>
  );
}
