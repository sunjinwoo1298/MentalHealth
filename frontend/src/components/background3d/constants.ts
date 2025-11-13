import { Bounds } from './types';

export const AUTUMN_PALETTE = [
  'hsl(15, 90%, 58%)',
  'hsl(28, 95%, 62%)',
  'hsl(42, 98%, 68%)',
  'hsl(8, 85%, 52%)',
  'hsl(35, 92%, 60%)',
  'hsl(18, 80%, 48%)',
  'hsl(48, 95%, 72%)',
  'hsl(5, 75%, 45%)',
  'hsl(38, 88%, 65%)',
  'hsl(25, 82%, 54%)'
];

export const LEAF_TYPES = ['maple','oak','birch','ginkgo','willow'];

export const WORLD_BOUNDS: Bounds = {
  minX: -10,
  maxX: 10,
  minY: -6,
  maxY: 6,
  minZ: -6,
  maxZ: 2,
};

export const BASE_LEAF_COUNT = 35;
export const EXTRA_LEAF_MAX = 40;
