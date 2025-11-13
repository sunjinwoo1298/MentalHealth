import React, { useEffect, useMemo, useRef } from 'react';

interface FallingLeafSpriteProps {
  index: number;
  textureUrl: string;
}

export const FallingLeafSprite: React.FC<FallingLeafSpriteProps> = ({ index, textureUrl }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const seed = useMemo(() => ((index + 1) * 9301) % 233280, [index]);
  const rand = (min: number, max: number) => {
    const x = (Math.sin(seed + index * 17.23) * 10000) % 1; // deterministic-ish
    return min + (max - min) * Math.abs(x);
  };

  const startLeft = useMemo(() => rand(0, 100), [rand]);
  // Faster fall (shorter duration) and slightly broader sway for more natural wind drift
  const duration = useMemo(() => rand(8, 18), [rand]);
  const sway = useMemo(() => rand(55, 130), [rand]);
  const delay = useMemo(() => rand(0, 10), [rand]);
  const spin = useMemo(() => rand(180, 880), [rand]);
  const startTop = useMemo(() => rand(-20, 0), [rand]); // start slightly above viewport for natural entry
  const size = useMemo(() => rand(18, 46), [rand]);
  const opacity = useMemo(() => rand(0.35, 0.9), [rand]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--fall-duration', `${duration}s`);
    ref.current.style.setProperty('--fall-delay', `${delay}s`);
    ref.current.style.setProperty('--sway-distance', `${sway}px`);
    ref.current.style.setProperty('--spin-deg', `${spin}deg`);
    ref.current.style.setProperty('--start-top', `${startTop}px`);
  }, [duration, delay, sway, spin, startTop]);

  return (
    <div
      ref={ref}
      className="falling-leaf-sprite pointer-events-none"
      style={{
        position: 'absolute',
        top: `${startTop}px`,
        left: `${startLeft}%`,
        width: size,
        height: size,
        backgroundImage: `url(${textureUrl})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        opacity,
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
        animation: `leafFall var(--fall-duration) linear var(--fall-delay) infinite, leafSway var(--fall-duration) ease-in-out var(--fall-delay) infinite, leafSpin var(--fall-duration) linear var(--fall-delay) infinite`,
        transformOrigin: '50% 50%',
        zIndex: 2,
      }}
    />
  );
};
