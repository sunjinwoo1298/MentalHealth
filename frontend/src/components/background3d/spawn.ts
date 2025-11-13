import { WORLD_BOUNDS } from './constants';
import * as THREE from 'three';

export function registerGlobalSpawners() {
  (window as any).__spawnLeaves = function(count = 10) {
    const leaves: any[] = [];
    for (let i = 0; i < count; i++) {
      leaves.push({
        position: [
          (Math.random() - 0.5) * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX),
          WORLD_BOUNDS.maxY,
          WORLD_BOUNDS.minZ + Math.random() * (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ)
        ],
        scale: 0.8 + Math.random() * 1.2,
      });
    }
    return leaves;
  };

  (window as any).__fireConfetti = function() {
    if (document) {
      const el = document.createElement('div');
      el.textContent = '🍁';
      el.style.position = 'fixed';
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.transform = 'translate(-50%, -50%) scale(3)';
      el.style.animation = 'fadePop 1.2s ease-out forwards';
      el.style.zIndex = '9999';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1300);
    }
  };
}

export function InjectExtraKeyframes() {
  return (
    <style>{`
      @keyframes fadePop { 0% { opacity:0; transform:translate(-50%,-50%) scale(0.4);} 60% { opacity:1; transform:translate(-50%,-50%) scale(3);} 100% { opacity:0; transform:translate(-50%,-50%) scale(0.2);} }
    `}</style>
  );
}
