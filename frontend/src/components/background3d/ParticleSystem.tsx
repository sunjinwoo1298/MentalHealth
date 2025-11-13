import React, { useEffect, useRef } from 'react';

interface ParticleSystemProps {
  containerId?: string;
  textureUrl: string;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ containerId = 'leaf-sprite-layer', textureUrl }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const existing = document.getElementById(containerId);
    if (existing) {
      containerRef.current = existing as HTMLDivElement;
    } else {
      const el = document.createElement('div');
      el.id = containerId;
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.pointerEvents = 'none';
      el.style.overflow = 'hidden';
      el.style.zIndex = '2';
      document.body.appendChild(el);
      containerRef.current = el;
    }
  }, [containerId]);

  useEffect(() => {
    if (!containerRef.current) return;
    function spawn(count = 12) {
      for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'falling-leaf-sprite';
        const startLeft = Math.random() * 100;
        const startTop = -20 - Math.random() * 40;
        const duration = 12 + Math.random() * 18;
        const delay = Math.random() * 8;
        const sway = 45 + Math.random() * 60;
        const spin = 180 + Math.random() * 720;
        const size = 18 + Math.random() * 36;
        const opacity = 0.35 + Math.random() * 0.55;
        div.style.cssText = `position:absolute;top:${startTop}px;left:${startLeft}%;width:${size}px;height:${size}px;background-image:url(${textureUrl});background-size:contain;background-repeat:no-repeat;opacity:${opacity};filter:drop-shadow(0 2px 3px rgba(0,0,0,0.25));animation:leafFall ${duration}s linear ${delay}s infinite,leafSway ${duration}s ease-in-out ${delay}s infinite,leafSpin ${duration}s linear ${delay}s infinite;transform-origin:50% 50%;z-index:2;`;
        div.style.setProperty('--fall-duration', `${duration}s`);
        div.style.setProperty('--fall-delay', `${delay}s`);
        div.style.setProperty('--sway-distance', `${sway}px`);
        div.style.setProperty('--spin-deg', `${spin}deg`);
        div.style.setProperty('--start-top', `${startTop}px`);
        containerRef.current.appendChild(div);
      }
    }
    (window as any).__spawnParticles = spawn;
    spawn(20);
  }, [textureUrl]);

  return null;
};
