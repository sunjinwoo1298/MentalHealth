import React from 'react';

export const KeyframesStyle: React.FC = () => (
  <style>{`
    /* Vertical descent */
    @keyframes leafFall {
      0% { transform: translate3d(0, var(--start-top), 0); }
      100% { transform: translate3d(0, calc(100vh + 40px), 0); }
    }
    /* Smooth wind drift: symmetric to avoid snapping on loop */
    @keyframes leafSway {
      0% { transform: translateX(0) rotateZ(0deg); }
      20% { transform: translateX(calc(var(--sway-distance) * 0.35)) rotateZ(3deg); }
      50% { transform: translateX(calc(var(--sway-distance) * 0.85)) rotateZ(-3deg); }
      80% { transform: translateX(calc(var(--sway-distance) * 0.35)) rotateZ(2deg); }
      100% { transform: translateX(0) rotateZ(0deg); }
    }
    /* Spin remains simple for performance */
    @keyframes leafSpin {
      0% { transform: rotateY(0deg) rotateX(0deg); }
      100% { transform: rotateY(var(--spin-deg)) rotateX(var(--spin-deg)); }
    }
  `}</style>
);
