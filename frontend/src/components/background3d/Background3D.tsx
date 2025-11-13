import React, { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Leaf } from './Leaf';
import { FallingLeafSprite } from './FallingLeafSprite';
import { KeyframesStyle } from './KeyframesStyle';
import { ParticleSystem } from './ParticleSystem';
import { registerGlobalSpawners, InjectExtraKeyframes } from './spawn';
import { LEAF_PALETTE, LEAF_SHAPES, WORLD_BOUNDS } from './constants';

const LEAF_TEXTURE_URL = '/assests/maple_leaf.png';

export const Background3D: React.FC = () => {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const leafTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(LEAF_TEXTURE_URL);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  const leaves = useMemo(() => {
    const arr: { id: string; color: string; position: [number, number, number]; scale: number; targetColor?: string; shape: any }[] = [];
    const total = 38;
    for (let i = 0; i < total; i++) {
      const color = LEAF_PALETTE[i % LEAF_PALETTE.length];
      const shape = LEAF_SHAPES[i % LEAF_SHAPES.length];
      arr.push({
        id: `leaf-${i}`,
        color,
        position: [
          (Math.random() - 0.5) * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX),
          WORLD_BOUNDS.maxY - Math.random() * (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY),
          WORLD_BOUNDS.minZ + Math.random() * (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ)
        ],
        scale: 0.9 + Math.random() * 1.3,
        shape,
        targetColor: undefined
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    registerGlobalSpawners();
  }, []);

  if (reducedMotion) {
    return <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg,#2d1c10,#4a2f18,#2d1c10)' }} />;
  }

  return (
    <>
      <KeyframesStyle />
      <InjectExtraKeyframes />
      <Canvas
        shadows
        dpr={[1, 1.8]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 10], fov: 52 }}
        style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[10, 12, 6]} intensity={0.85} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        {leaves.map(leaf => (
          <Leaf
            key={leaf.id}
            id={leaf.id}
            color={leaf.color}
            position={leaf.position}
            scale={leaf.scale}
            shape={leaf.shape}
            texture={leafTexture}
          />
        ))}
      </Canvas>
      <div
        id="leaf-sprite-layer"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 2 }}
      >
        {Array.from({ length: 26 }).map((_, i) => (
          <FallingLeafSprite key={i} index={i} textureUrl={LEAF_TEXTURE_URL} />
        ))}
      </div>
      <ParticleSystem textureUrl={LEAF_TEXTURE_URL} />
    </>
  );
};
