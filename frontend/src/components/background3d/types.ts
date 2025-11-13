import * as THREE from 'three';

export interface LeafProps {
  id: string;
  color: string;
  position: [number, number, number];
  scale?: number;
  targetColor?: string;
  shape?: 'maple' | 'oak' | 'birch' | 'ginkgo' | 'willow' | 'generic';
  texture?: THREE.Texture | null;
}

export interface Particle {
  id: string;
  pos: [number, number, number];
  vel: [number, number, number];
  life: number;
  ttl: number;
  color: string;
}

export interface LeafConfig {
  count: number;
  palette: string[];
  shapes: LeafProps['shape'][];
}

export interface SpawnLeafOptions {
  count?: number;
  palette?: string[];
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}
