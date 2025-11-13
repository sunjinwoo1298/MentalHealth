import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas as R3Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useConfetti } from "@/hooks/useConfetti";
import mapleLeafImage from "@/assets/maple-leaf.png";

/** UID generator */
let __bg3d_uid = 1;
function makeId(prefix = "") {
  return `${prefix}${Date.now()}-${__bg3d_uid++}-${Math.floor(Math.random() * 1000000)}`;
}

/** Enhanced Leaf component with calming autumn aesthetic and texture support */
function Leaf({
  id,
  color,
  position,
  scale = 1,
  targetColor,
  shape = "maple",
  texture,
}: {
  id: string;
  color: string;
  position: [number, number, number];
  scale?: number;
  targetColor?: string;
  shape?: string;
  texture?: THREE.Texture | null;
}) {
  const mesh = useRef<THREE.Mesh | null>(null);
  const matRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const dragging = useRef(false);
  const offset = useRef(new THREE.Vector3());
  
  // Slower, more calming initial velocities for gentle drifting
  const vel = useRef(
    new THREE.Vector3(
      (Math.random() - 0.5) * 0.15,  // Slower horizontal drift
      -0.05 - Math.random() * 0.08,   // Gentle downward fall
      (Math.random() - 0.5) * 0.08    // Subtle depth movement
    )
  );
  const targetThree = useRef<THREE.Color | null>(null);
  const hovered = useRef(false);
  const prevTimeRef = useRef<number | null>(null);
  
  // Wobble parameters for natural leaf motion
  const wobblePhase = useRef(Math.random() * Math.PI * 2);
  const wobbleSpeed = useRef(0.5 + Math.random() * 0.5);
  const wobbleAmplitude = useRef(0.3 + Math.random() * 0.4);

  // stable numeric seed derived from id (avoids Number(id) NaN)
  const seed = useMemo(() => {
    let n = 0;
    for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) >>> 0;
    return n % 10000;
  }, [id]);

  const bounds = useMemo(
    () => ({
      // Expanded world bounds to fill more of the viewport
      minX: -10,
      maxX: 10,
      minY: -6,
      maxY: 6,
      minZ: -6,
      maxZ: 2,
    }),
    []
  );

  // initialize material color from CSS string safely
  useEffect(() => {
    if (!matRef.current || typeof document === "undefined") return;
    try {
      const el = document.createElement("div");
      el.style.color = color;
      document.body.appendChild(el);
      const computed = getComputedStyle(el).color;
      document.body.removeChild(el);
      matRef.current.color = new THREE.Color(computed);
    } catch {
      matRef.current.color = new THREE.Color(0xffffff);
    }

    if (targetColor && matRef.current) {
      try {
        const el2 = document.createElement("div");
        el2.style.color = targetColor;
        document.body.appendChild(el2);
        const computed2 = getComputedStyle(el2).color;
        document.body.removeChild(el2);
        targetThree.current = new THREE.Color(computed2);
      } catch {
        targetThree.current = null;
      }
    }
  }, [color, targetColor]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const prev = prevTimeRef.current ?? t;
    const delta = t - prev;
    prevTimeRef.current = t;

    if (!mesh.current || !matRef.current) return;

    if (!dragging.current) {
      // Natural falling motion with horizontal wobble (like real leaves)
      const wobble = Math.sin(t * wobbleSpeed.current + wobblePhase.current) * wobbleAmplitude.current;
      mesh.current.position.x += (vel.current.x + wobble * 0.15) * delta;
      mesh.current.position.y += vel.current.y * delta;
      mesh.current.position.z += vel.current.z * delta;

      // Graceful tumbling rotation - like leaves floating down
      const baseSpeed = 0.0008 + (hovered.current ? 0.003 : 0.0005);
      mesh.current.rotation.x += baseSpeed * (0.6 + Math.sin(t * 0.5 + seed * 0.001) * 0.5);
      mesh.current.rotation.y += baseSpeed * (1.2 + Math.cos(t * 0.4 + seed * 0.001) * 0.8);
      mesh.current.rotation.z += baseSpeed * (0.4 + Math.sin(t * 0.3 + seed * 0.001) * 0.6) * wobble;

      // Seamless loop: when leaves fall off screen, respawn at top
      if (mesh.current.position.y < bounds.minY) {
        mesh.current.position.y = bounds.maxY;
        mesh.current.position.x = (Math.random() - 0.5) * (bounds.maxX - bounds.minX);
        mesh.current.position.z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
        // Reset velocity for natural variation
        vel.current.x = (Math.random() - 0.5) * 0.15;
        vel.current.y = -0.05 - Math.random() * 0.08;
        wobblePhase.current = Math.random() * Math.PI * 2;
      }
      
      // Gentle horizontal bounds with wrap-around
      if (mesh.current.position.x < bounds.minX) {
        mesh.current.position.x = bounds.maxX;
      }
      if (mesh.current.position.x > bounds.maxX) {
        mesh.current.position.x = bounds.minX;
      }
      
      // Depth bounds
      if (mesh.current.position.z < bounds.minZ) {
        mesh.current.position.z = bounds.minZ;
        vel.current.z *= -0.5;
      }
      if (mesh.current.position.z > bounds.maxZ) {
        mesh.current.position.z = bounds.maxZ;
        vel.current.z *= -0.5;
      }

      // Minimal damping for sustained motion
      vel.current.multiplyScalar(Math.max(0, 1 - 0.0005 * (delta * 60)));
      // gentle scale pulse when hovered
      if (hovered.current) {
        mesh.current.scale.lerp(new THREE.Vector3(scale * 1.08, scale * 1.08, scale * 1.08), Math.min(0.06 * delta * 60, 0.15));
      } else {
        mesh.current.scale.lerp(new THREE.Vector3(scale, scale, scale), Math.min(0.05 * delta * 60, 0.15));
      }
    } else {
      mesh.current.rotation.x += 0.02;
      mesh.current.rotation.y += 0.03;
    }

    // slowly lerp color toward target
    if (targetThree.current) {
      matRef.current.color.lerp(targetThree.current, Math.min(0.02 * (delta * 60), 0.05));
    }

    // soft emissive glow when hovered
    const emissiveTarget = hovered.current ? 0.2 : 0.05;
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(matRef.current.emissiveIntensity || 0, emissiveTarget, 0.03);
  });

  // expose external click handler
  useEffect(() => {
    if (!mesh.current) return;
    (mesh.current as any).userData = (mesh.current as any).userData || {};
    (mesh.current as any).userData._onExternalClick = (payload: any) => {
      try {
        onClick(payload);
      } catch {
        // ignore
      }
    };
    // cleanup: remove custom userData entry
    return () => {
      if (mesh.current && (mesh.current as any).userData) {
        delete (mesh.current as any).userData._onExternalClick;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesh.current]);

  function onPointerDown(e: any) {
    e.stopPropagation();
    dragging.current = true;
    if (mesh.current && e.point) {
      offset.current.subVectors(mesh.current.position, e.point);
    }
    if (typeof document !== "undefined") document.body.style.cursor = "grabbing";
  }

  function onPointerMove(e: any) {
    e.stopPropagation();
    if (!dragging.current || !mesh.current || !e.point) return;
    const target = e.point.clone().add(offset.current);
    mesh.current.position.lerp(target, 0.25);
  }

  function onPointerUp(e: any) {
    e.stopPropagation();
    const wasDragging = dragging.current;
    dragging.current = false;
    if (typeof document !== "undefined") document.body.style.cursor = "default";
    if (mesh.current) mesh.current.scale.setScalar(scale);
    if (!wasDragging) return;
  }

  function onPointerOver(e: any) {
    e.stopPropagation();
    hovered.current = true;
  }

  function onPointerOut(e: any) {
    e.stopPropagation();
    hovered.current = false;
  }

  function onClick(e: any) {
    e.stopPropagation();
    const confetti = (typeof window !== "undefined" ? (window as any).__fireConfetti : undefined);
    if (typeof confetti === "function") confetti();

    // impulse away from center plus randomness
    if (mesh.current) {
      try {
        const dir = mesh.current.position.clone().normalize().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6)).normalize();
        const strength = 1.1 + Math.random() * 0.8;
        vel.current.copy(dir.multiplyScalar(strength));
      } catch {
        vel.current.add(new THREE.Vector3((Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.2));
      }
    }

    // spawn sparkle particles via global if available
    try {
      const spawn = (typeof window !== "undefined" ? (window as any).__spawnParticles : undefined);
      if (typeof spawn === "function" && mesh.current) {
        spawn({ x: mesh.current.position.x, y: mesh.current.position.y, z: mesh.current.position.z }, "hsl(40, 95%, 70%)", 12);
      }
    } catch {
      // ignore
    }

    // warm autumn color flash
    if (matRef.current) {
      const prev = matRef.current.color.clone();
      try {
        const el = document.createElement("div");
        el.style.color = "hsl(45, 95%, 65%)"; // Golden yellow
        document.body.appendChild(el);
        const comp = getComputedStyle(el).color;
        document.body.removeChild(el);
        matRef.current.color = new THREE.Color(comp);
        setTimeout(() => {
          if (matRef.current) matRef.current.color.lerp(prev, 0.96);
        }, 400);
      } catch {
        // ignore
      }
    }
  }

  function geometryByShape() {
    // Create realistic leaf shapes with subtle variations
    // Using more segments for smoother, rounded edges
    switch (shape) {
      case "maple":
        // Maple leaf - classic 5-pointed shape
        return <planeGeometry args={[1.2, 1.2, 4, 4]} />;
      case "oak":
        // Oak leaf - rounded with lobes
        return <planeGeometry args={[0.9, 1.3, 4, 4]} />;
      case "birch":
        // Birch leaf - oval/teardrop
        return <planeGeometry args={[0.8, 1.1, 4, 4]} />;
      case "ginkgo":
        // Ginkgo leaf - fan-shaped
        return <planeGeometry args={[1.1, 1.0, 4, 4]} />;
      case "willow":
        // Willow leaf - long and narrow
        return <planeGeometry args={[0.5, 1.4, 4, 4]} />;
      default:
        return <planeGeometry args={[1.0, 1.2, 4, 4]} />;
    }
  }

  return (
    <Float speed={0.3} rotationIntensity={0.2} floatIntensity={0.1}>
      <mesh
        ref={mesh}
        position={position}
        scale={scale}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
        castShadow={true}
        receiveShadow={false}
      >
        {geometryByShape()}
        <meshStandardMaterial
          ref={(r: any) => {
            // r may be null on unmount
            matRef.current = r ?? null;
          }}
          color={color}
          map={texture}
          roughness={0.7}
          metalness={0.02}
          transparent
          opacity={texture ? 0.95 : 0.85}
          emissive={color}
          emissiveIntensity={0.08}
          envMapIntensity={0.3}
          side={THREE.DoubleSide}
          alphaTest={texture ? 0.1 : 0}
        />
      </mesh>
    </Float>
  );
}

/** Interaction bridge for window pointer events -> three objects with userData._onExternalClick */
function InteractionBridge() {
  const { camera, scene, gl } = useThree();
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const handler = (e: PointerEvent) => {
      if (!gl?.domElement) return;
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length) {
        const obj = intersects[0].object as any;
        if (obj && obj.userData && typeof obj.userData._onExternalClick === "function") {
          try {
            obj.userData._onExternalClick({ clientX: e.clientX, clientY: e.clientY });
          } catch {
            // ignore
          }
        }
      }
    };
    window.addEventListener("pointerdown", handler);
    return () => window.removeEventListener("pointerdown", handler);
  }, [camera, scene, gl]);
  return null;
}

/** Falling Leaf Sprite Component with natural wind physics */
function FallingLeafSprite({ index = 0 }: { index?: number }) {
  const position = useMemo(() => {
    // Create deterministic random seed from index
    const seed = index * 9301 + 49297;
    const random = (offset = 0) => ((seed + offset) % 233280) / 233280;
    
    // Full viewport coverage: distribute leaves from -5% to 105% for edge overflow
    const leftPosition = Math.random() * 100; // covers full width
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const startTop = -200 - Math.random() * vh; // start from above up to one screen height further
    
    // Depth layers: foreground (fast/large), midground, background (slow/small)
    const depthValue = random(2);
    const isForeground = depthValue > 0.7;
    const isBackground = depthValue < 0.3;
    
    // Wind influence: diagonal drift and speed variation
    const windStrength = 0.3 + random(3) * 0.7; // 0.3-1.0
    const windDirection = random(4) > 0.5 ? 1 : -1; // Left or right drift
    
    return {
      left: leftPosition,
      startDelay: random(5) * 4, // Staggered start (0-4s)
      animationDuration: isForeground 
        ? 5 + random(6) * 3 
        : isBackground 
          ? 12 + random(6) * 6 
          : 8 + random(6) * 4,
      size: isForeground 
        ? 40 + random(7) * 35 
        : isBackground 
          ? 15 + random(7) * 20 
          : 25 + random(7) * 30,
      opacity: isForeground 
        ? 0.7 + random(8) * 0.3 
        : isBackground 
          ? 0.3 + random(8) * 0.3 
          : 0.5 + random(8) * 0.4,
      blur: isBackground ? 1.5 : isForeground ? 0 : 0.5,
      swayDistance: 40 + random(9) * 100,
      swayDuration: 2.5 + random(10) * 2,
      rotations: 1 + random(11) * 5,
      initialRotation: random(12) * 360,
      windStrength,
      windDirection,
      depthLayer: isForeground ? 'foreground' : isBackground ? 'background' : 'midground',
      diagonalDrift: windStrength * windDirection * 15,
      startTop,
    };
  }, [index]);

  return (
    <div
      className={`falling-leaf-sprite depth-${position.depthLayer}`}
      style={{
        position: 'fixed',
        left: `${position.left}%`,
        top: `${position.startTop}px`, // Randomized start above viewport for staggered entry
        width: `${position.size}px`,
        height: `${position.size}px`,
        backgroundImage: `url(${mapleLeafImage})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        pointerEvents: 'none',
        zIndex: position.depthLayer === 'foreground' ? 9999 : position.depthLayer === 'background' ? 1 : 100,
        opacity: position.opacity,
        transform: `rotate(${position.initialRotation}deg)`,
        filter: position.blur > 0 ? `blur(${position.blur}px)` : 'none',
        animation: `
          leafFallWithWind-${position.windDirection > 0 ? 'right' : 'left'} ${position.animationDuration}s ease-in ${position.startDelay}s infinite,
          leafSwayNatural ${position.swayDuration}s ease-in-out ${position.startDelay}s infinite,
          leafRotateComplex ${position.animationDuration * 0.8}s ease-in-out ${position.startDelay}s infinite,
          leafTumble ${position.animationDuration * 0.6}s ease-in-out ${position.startDelay}s infinite
        `,
        '--sway-distance': `${position.swayDistance}px`,
        '--rotation-total': `${position.rotations * 360}deg`,
        '--diagonal-drift': `${position.diagonalDrift}vw`,
        '--wind-strength': `${position.windStrength}`,
      } as React.CSSProperties}
    />
  );
}

/** Main Background3D */
export function Background3D() {
  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fireConfetti = useConfetti();
  
  // Configurable leaf animation parameters
  const leafConfig = {
    count: 50, // Total number of leaves (adjustable: 30-70)
    colors: ['#D2691E', '#FF8C00', '#FFD700', '#CD853F', '#FF6347', '#FFA500'], // Autumn palette
    enableWind: true,
    windStrength: 0.6, // 0-1 scale
    enableAccessibilityControls: true,
  };

  // Generate dense coverage of falling leaf sprites
  const leafSprites = useMemo(() => {
    return Array.from({ length: leafConfig.count }, (_, i) => ({
      id: `sprite-${i}`,
      index: i,
    }));
  }, [leafConfig.count]);

  // expose confetti globally (cleaned up on unmount)
  useEffect(() => {
    const global = typeof window !== "undefined" ? (window as any) : undefined;
    if (global) {
      global.__fireConfetti = fireConfetti;
      return () => {
        try {
          delete global.__fireConfetti;
        } catch {
          global.__fireConfetti = undefined;
        }
      };
    }
  }, [fireConfetti]);

  if (prefersReduced) {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, 
              hsla(38, 70%, 65%, 0.15) 0%,
              hsla(28, 75%, 60%, 0.12) 35%,
              hsla(15, 68%, 55%, 0.1) 70%,
              hsla(8, 60%, 50%, 0.08) 100%
            )`,
            backdropFilter: "blur(10px)",
          }}
        />
      </div>
    );
  }

  // Beautiful autumn leaf varieties
  const leafTypes = ["maple", "oak", "birch", "ginkgo", "willow"];

  // Load maple texture from imported image
  const mapleTexture = useMemo(() => {
    try {
      const loader = new THREE.TextureLoader();
      return loader.load(
        mapleLeafImage, 
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
        }
      );
    } catch {
      return null;
    }
  }, []);

  const baseBlobs = useMemo(() => {
    // Rich, vibrant autumn color palette inspired by nature
    const palette = [
      "hsl(15, 90%, 58%)",   // Fiery red-orange
      "hsl(28, 95%, 62%)",   // Rich burnt orange
      "hsl(42, 98%, 68%)",   // Deep golden yellow
      "hsl(8, 85%, 52%)",    // Deep crimson red
      "hsl(35, 92%, 60%)",   // Warm amber
      "hsl(18, 80%, 48%)",   // Dark rust
      "hsl(48, 95%, 72%)",   // Bright gold
      "hsl(5, 75%, 45%)",    // Burgundy
      "hsl(38, 88%, 65%)",   // Sunset orange
      "hsl(25, 82%, 54%)",   // Terra cotta
    ];
    
    // Generate more leaves for fuller, calming scene
    const shapes: Array<{ id: string; color: string; position: [number, number, number]; scale: number; shape?: string }> = [];
    const minDistance = 1.5; // Closer spacing for natural density
    const maxAttempts = 80;
    
    for (let i = 0; i < 35; i++) {
      const id = makeId("leaf-");
      const color = palette[i % palette.length];
      const shape = leafTypes[i % leafTypes.length];
      // Varied sizes from small to large for depth perception
      const scale = 0.4 + Math.random() * 1.1;
      
      let position: [number, number, number] = [0, 0, 0];
      let validPosition = false;
      let attempts = 0;
      
      // Distribute leaves naturally across the viewport
      while (!validPosition && attempts < maxAttempts) {
        position = [
          (Math.random() - 0.5) * 20,    // Horizontal spread -10..10
          (Math.random() - 0.5) * 12,    // Vertical spread -6..6
          -2 - Math.random() * 6         // Depth -2..-8 (inside bounds -6..2)
        ];
        
        validPosition = shapes.every(existing => {
          const dx = existing.position[0] - position[0];
          const dy = existing.position[1] - position[1];
          const dz = existing.position[2] - position[2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          return distance >= minDistance;
        });
        
        attempts++;
      }
      
      shapes.push({ id, color, position, scale, shape });
    }
    
    return shapes;
  }, []);

  const [extraBlobs, setExtraBlobs] = useState<
    Array<{ id: string; color: string; position: [number, number, number]; scale: number; shape?: string; targetColor?: string }>
  >([]);
  const MAX_EXTRA = 40; // More ambient leaves for continuous gentle falling

  // ambient spawner - continuous gentle falling leaves
  useEffect(() => {
    const id = setInterval(() => {
      setExtraBlobs((s) => {
        if (s.length >= MAX_EXTRA) return s;
        const toCreate = Math.min(2, MAX_EXTRA - s.length);
        const palette = [
          "hsl(15, 90%, 58%)",
          "hsl(28, 95%, 62%)",
          "hsl(42, 98%, 68%)",
          "hsl(8, 85%, 52%)",
          "hsl(35, 92%, 60%)",
          "hsl(18, 80%, 48%)",
          "hsl(48, 95%, 72%)",
          "hsl(5, 75%, 45%)",
          "hsl(38, 88%, 65%)",
          "hsl(25, 82%, 54%)",
        ];
        const created: Array<{ id: string; color: string; position: [number, number, number]; scale: number; shape?: string; targetColor?: string }> = [];
        const minDistance = 1.3;
        const maxAttempts = 40;
        
        for (let i = 0; i < toCreate; i++) {
          const id = makeId("falling-leaf-");
          const shape = leafTypes[Math.floor(Math.random() * leafTypes.length)];
          const color = palette[Math.floor(Math.random() * palette.length)];
          const targetColor = palette[(Math.floor(Math.random() * palette.length) + 1) % palette.length];
          const scale = 0.4 + Math.random() * 0.9;
          
          let position: [number, number, number] = [0, 0, 0];
          let validPosition = false;
          let attempts = 0;
          
          // Spawn new leaves at the top of viewport for natural falling effect
          while (!validPosition && attempts < maxAttempts) {
            position = [
              (Math.random() - 0.5) * 20,     // Full expanded width -10..10
              6 + Math.random() * 0.5,        // Spawn slightly above top bound (maxY = 6)
              -2 - Math.random() * 6          // Depth variation
            ];
            
            validPosition = [...s, ...created].every(existing => {
              const dx = existing.position[0] - position[0];
              const dy = existing.position[1] - position[1];
              const dz = existing.position[2] - position[2];
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              return distance >= minDistance;
            });
            
            attempts++;
          }
          
          created.push({ id, color, position, scale, targetColor, shape });
        }
        
        // Longer lifespan for continuous, meditative falling effect
        setTimeout(() => {
          setExtraBlobs((cur) => cur.filter((b) => !created.some((c) => c.id === b.id)));
        }, 15000 + Math.random() * 5000);
        return [...s, ...created];
      });
    }, 2500); // More frequent spawning for continuous flow
    return () => clearInterval(id);
  }, []);

  // particles state
  type Particle = { id: string; pos: [number, number, number]; vel: [number, number, number]; life: number; ttl: number; color: string };
  const [particles, setParticles] = useState<Particle[]>([]);

  function spawnParticlesAt(_posVec: THREE.Vector3, color = "hsl(30, 90%, 60%)", count = 10) {
    const created: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const id = makeId("part-");
      // Spawn across entire top width (left to right)
      const randomX = (Math.random() - 0.5) * 10; // -5 to +5 (full width coverage)
      const randomY = 2.5 + Math.random() * 0.8; // Top of viewport (2.5 to 3.3)
      const randomZ = -0.5 - Math.random() * 3; // Varied depth
      
      const base = new THREE.Vector3(randomX, randomY, randomZ);
      const dir = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize();
      const speed = 0.8 + Math.random() * 1.5;
      const vel: [number, number, number] = [dir.x * speed * 1.2, dir.y * speed * 1.2, dir.z * speed * 1.2];
      const life = 0;
      const ttl = 1.2 + Math.random() * 1.0;
      created.push({ id, pos: [base.x, base.y, base.z], vel, life, ttl, color });
    }
    setParticles((s) => [...s, ...created]);
  }

  // register global spawner
  useEffect(() => {
    const global = typeof window !== "undefined" ? (window as any) : undefined;
    if (!global) return;
    global.__spawnParticles = (p: { x: number; y: number; z?: number }, color?: string, count = 12) => {
      const vec = new THREE.Vector3(p.x, p.y, p.z ?? -1);
      spawnParticlesAt(vec, color, count);
    };
    // spawn leaves API - autumn palette with spacing
    global.__spawnBlobs = ({ count = 8, palette = [
      "hsl(15, 85%, 55%)",
      "hsl(30, 90%, 60%)",
      "hsl(45, 95%, 65%)",
      "hsl(25, 80%, 50%)",
    ] } = {}) => {
      const created: Array<{ id: string; color: string; position: [number, number, number]; scale: number; shape?: string; targetColor?: string }> = [];
      const minDistance = 1.5;
      const maxAttempts = 40;
      
      for (let i = 0; i < count; i++) {
        const id = makeId("spawn-leaf-");
        const shape = leafTypes[Math.floor(Math.random() * leafTypes.length)];
        const color = palette[Math.floor(Math.random() * palette.length)];
        const targetColor = palette[(Math.floor(Math.random() * palette.length) + 1) % palette.length];
        const scale = 0.6 + Math.random() * 1.0;
        
        let position: [number, number, number] = [0, 0, 0];
        let validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < maxAttempts) {
          position = [
            (Math.random() - 0.5) * 20,      // Wider X spread
            (Math.random() - 0.5) * 12,      // Wider Y spread
            -2 - Math.random() * 6           // Depth
          ];
          
          validPosition = created.every(existing => {
            const dx = existing.position[0] - position[0];
            const dy = existing.position[1] - position[1];
            const dz = existing.position[2] - position[2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            return distance >= minDistance;
          });
          
          attempts++;
        }
        
        created.push({ id, color, position, scale, targetColor, shape });
      }
      
      setExtraBlobs((s) => [...s, ...created]);
      setTimeout(() => {
        setExtraBlobs((s) => s.filter((b) => !created.some((c) => c.id === b.id)));
      }, 6000);
    };

    return () => {
      try {
        delete global.__spawnParticles;
        delete global.__spawnBlobs;
      } catch {
        global.__spawnParticles = undefined;
        global.__spawnBlobs = undefined;
      }
    };
  }, []);

  // ParticleSystem component: avoids mutating state
  function ParticleSystem({ particles, setParticles }: { particles: Particle[]; setParticles: React.Dispatch<React.SetStateAction<Particle[]>> }) {
    useFrame((_, delta) => {
      if (!particles.length) return;
      setParticles((prev) => {
        const next: Particle[] = [];
        for (const p of prev) {
          const life = p.life + delta;
          const lifeRatio = life / p.ttl;
          if (lifeRatio >= 1) continue;
          const pos: [number, number, number] = [p.pos[0] + p.vel[0] * delta, p.pos[1] + p.vel[1] * delta, p.pos[2] + p.vel[2] * delta];
          const vel: [number, number, number] = [p.vel[0] * (1 - delta * 0.5), p.vel[1] * (1 - delta * 0.5), p.vel[2] * (1 - delta * 0.5)];
          next.push({ ...p, pos, vel, life });
        }
        return next;
      });
    });

    return (
      <group>
        {particles.map((p) => {
          const opacity = Math.max(0, 1 - p.life / p.ttl) * 0.7;
          return (
            <mesh key={p.id} position={p.pos}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial 
                color={p.color} 
                transparent 
                opacity={opacity} 
                emissive={p.color} 
                emissiveIntensity={0.5}
                roughness={0.3}
              />
            </mesh>
          );
        })}
      </group>
    );
  }

  // small mount log (optional)
  useEffect(() => {
    // debug only; remove if noisy
    // console.log("Background3D mounted", { baseCount: baseBlobs.length });
  }, []);

  return (
    <>
      {/* Natural wind-influenced falling leaf animations with depth */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Simplified wind-influenced falling */
        @keyframes leafFallWithWind-right {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); }
          100% { transform: translateY(110vh) translateX(var(--diagonal-drift, 0)) rotate(360deg); }
        }
        @keyframes leafFallWithWind-left {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); }
          100% { transform: translateY(110vh) translateX(calc(-1 * var(--diagonal-drift, 0))) rotate(-360deg); }
        }
        @keyframes leafSwayNatural {
          0%,100% { transform: translateX(0); }
          50% { transform: translateX(var(--sway-distance, 30px)); }
        }
        @keyframes leafRotateComplex {
          from { transform: rotate(0deg); }
          to { transform: rotate(var(--rotation-total, 360deg)); }
        }
        @keyframes leafTumble {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(720deg); }
        }
        
        /* Depth-based styling */
        .falling-leaf-sprite {
          will-change: transform, margin-left;
          animation-timing-function: ease-in-out;
        }
        
        .depth-foreground {
          filter: drop-shadow(2px 4px 6px rgba(139, 69, 19, 0.3));
          z-index: 9999 !important;
        }
        
        .depth-midground {
          filter: drop-shadow(1px 2px 4px rgba(139, 69, 19, 0.2)) blur(0.5px);
          z-index: 100 !important;
        }
        
        .depth-background {
          filter: drop-shadow(0.5px 1px 2px rgba(139, 69, 19, 0.15)) blur(1.5px);
          z-index: 1 !important;
          opacity: 0.6;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .falling-leaf-sprite {
            opacity: 0.8 !important;
          }
          .depth-background {
            display: none; /* Reduce count on mobile */
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .falling-leaf-sprite {
            animation-duration: 30s !important;
            animation-iteration-count: 1 !important;
          }
        }
        
        /* Accessibility control */
        .leaves-paused .falling-leaf-sprite {
          animation-play-state: paused !important;
        }
        
        .leaves-hidden .falling-leaf-sprite {
          display: none !important;
        }
        
        .bg3d-canvas-wrapper {
          pointer-events: none !important;
        }
        .bg3d-canvas-wrapper canvas {
          pointer-events: auto !important;
        }
        /* Ensure all buttons and interactive elements stay clickable */
        button, a, input, textarea, select, [role="button"], [tabindex]:not([tabindex="-1"]) {
          pointer-events: auto !important;
          position: relative;
          z-index: 10000;
        }
      `}} />
      
      {/* 2D Falling leaf sprites overlay - beautifully distributed */}
      {!prefersReduced && leafSprites.map((sprite) => (
        <FallingLeafSprite key={sprite.id} index={sprite.index} />
      ))}
      
      <div aria-hidden className="bg3d-canvas-wrapper fixed inset-0 z-0">
        {/* Subtle warm gradient for depth - very light for transparency */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, 
              hsla(45, 60%, 85%, 0.08) 0%,
              hsla(30, 55%, 75%, 0.06) 40%,
              hsla(15, 50%, 70%, 0.04) 100%
            )`,
            mixBlendMode: "soft-light",
          }}
        />
        <div className="fixed inset-0 -z-10 w-full h-full">
        <R3Canvas
  camera={{ position: [0, 0, 6], fov: 60 }}
  style={{
    pointerEvents: "auto",
    width: "100%",
    height: "100%",
    position: "absolute",
    inset: 0,
    background: "transparent", // make transparent
  }}
  gl={{ alpha: true }} // allows transparency
>

        {/* Soft, dreamlike lighting for calming atmosphere */}
        <ambientLight intensity={0.85} color="#fffaf5" />
        <directionalLight 
          position={[6, 8, 4]} 
          intensity={0.5} 
          color="#ffe4c4"
          castShadow
          shadow-mapSize={[512, 512]}
          shadow-camera-far={40}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.25} color="#ffd7a3" />
        <pointLight position={[0, 4, 2]} intensity={0.3} color="#ffedd5" />
        
        {/* Subtle rim lighting for depth and 3D effect */}
        <pointLight position={[5, 0, -5]} intensity={0.15} color="#ff9966" />
        <pointLight position={[-5, 0, -5]} intensity={0.15} color="#ffcc99" />
        
        {baseBlobs.map((b) => (
          <Leaf key={b.id} id={b.id} color={b.color} position={b.position} scale={b.scale} shape={b.shape} texture={mapleTexture} />
        ))}
        {extraBlobs.map((b) => (
          <Leaf key={b.id} id={b.id} color={b.color} position={b.position} scale={b.scale} targetColor={b.targetColor} shape={b.shape} texture={mapleTexture} />
        ))}
        <InteractionBridge />
        <ParticleSystem particles={particles} setParticles={setParticles} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </R3Canvas>
      </div>
      </div>
    </>
  );
}
