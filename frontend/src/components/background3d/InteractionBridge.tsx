import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LeafProps } from './types';

interface InteractionBridgeProps {
  onLeafClick?: (leaf: LeafProps) => void;
  camera?: THREE.Camera;
}

export const InteractionBridge: React.FC<InteractionBridgeProps> = ({ onLeafClick, camera }) => {
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const leaves = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!camera) return;
      const rect = (e.target as HTMLElement)?.getBoundingClientRect?.() ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(leaves.current, true);
      if (intersects.length > 0 && onLeafClick) {
        const mesh = intersects[0].object as THREE.Mesh & { userData?: any };
        onLeafClick(mesh.userData?.leafMeta);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [camera, onLeafClick]);

  return null;
};
