import { Canvas as R3Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useConfetti } from "@/hooks/useConfetti";

// robust unique id generator to avoid collisions when spawning many objects quickly
let __bg3d_uid = 1;
function makeId(prefix = "") {
  return `${prefix}${Date.now()}-${__bg3d_uid++}-${Math.floor(Math.random()*1000000)}`;
}

function spawnSmiley(x: number, y: number) {
  const el = document.createElement("div");
  el.textContent = "😊";
  el.style.position = "fixed";
  el.style.left = `${x - 16}px`;
  el.style.top = `${y - 16}px`;
  el.style.fontSize = "28px";
  el.style.pointerEvents = "none";
  el.style.zIndex = "9999";
  el.style.opacity = "0";
  el.style.transform = "translateY(0px) scale(0.9)";
  el.style.transition = "transform 600ms cubic-bezier(.2,.9,.2,1), opacity 600ms";
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateY(-80px) scale(1)";
  });
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(-120px) scale(1.2)";
  }, 900);
  setTimeout(() => el.remove(), 1600);
}

function Blob({ id, color, position, scale = 1, speedFactor = 0.45, targetColor, shape = 'icosa' }: { id: string; color: string; position: [number, number, number]; scale?: number; speedFactor?: number; targetColor?: string; shape?: string }) {
  const mesh = useRef<THREE.Mesh | null>(null);
  const matRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const dragging = useRef(false);
  const offset = useRef(new THREE.Vector3());
  const vel = useRef(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.3));
  const targetThree = useRef<THREE.Color | null>(null);
  const basePos = useRef(new THREE.Vector3(...position));

  const bounds = useMemo(() => ({
    minX: -4, maxX: 4,
    minY: -2.5, maxY: 2.5,
    minZ: -4, maxZ: 0.5,
  }), []);

  // initialize material colors from CSS strings
  useEffect(() => {
    if (!matRef.current) return;
    try {
      const el = document.createElement('div');
      el.style.color = color;
      document.body.appendChild(el);
      const computed = getComputedStyle(el).color;
      document.body.removeChild(el);
      matRef.current.color = new THREE.Color(computed);
    } catch (e) {
      matRef.current.color = new THREE.Color(0xffffff);
    }

    if (targetColor && matRef.current) {
      try {
        const el2 = document.createElement('div');
        el2.style.color = targetColor;
        document.body.appendChild(el2);
        const computed2 = getComputedStyle(el2).color;
        document.body.removeChild(el2);
        targetThree.current = new THREE.Color(computed2);
      } catch (e) {
        targetThree.current = null;
      }
    }
  }, [color, targetColor]);

  // hover state to modify behavior
  const hovered = useRef(false);

  // Store previous time for delta calculation
  const prevTimeRef = useRef<number | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const prev = prevTimeRef.current ?? t;
    const delta = t - prev;
    prevTimeRef.current = t;

    if (!mesh.current || !matRef.current) return;

    // gentle orbit around base position + velocity-driven drift
    if (!dragging.current) {
      // apply small oscillation
      mesh.current.position.x = mesh.current.position.x + vel.current.x * delta;
      mesh.current.position.y = mesh.current.position.y + vel.current.y * delta;
      mesh.current.position.z = mesh.current.position.z + vel.current.z * delta;

      // gentle rotation
      const baseSpeed = 0.002 + (hovered.current ? 0.01 : 0.002);
      mesh.current.rotation.x += baseSpeed * (0.5 + Math.sin(t + Number(id)) * 0.5);
      mesh.current.rotation.y += baseSpeed * (0.6 + Math.cos(t * 0.8 + Number(id)) * 0.6);

      // bounds check and bounce
      if (mesh.current.position.x < bounds.minX) { mesh.current.position.x = bounds.minX; vel.current.x *= -0.9; }
      if (mesh.current.position.x > bounds.maxX) { mesh.current.position.x = bounds.maxX; vel.current.x *= -0.9; }
      if (mesh.current.position.y < bounds.minY) { mesh.current.position.y = bounds.minY; vel.current.y *= -0.88; }
      if (mesh.current.position.y > bounds.maxY) { mesh.current.position.y = bounds.maxY; vel.current.y *= -0.88; }
      if (mesh.current.position.z < bounds.minZ) { mesh.current.position.z = bounds.minZ; vel.current.z *= -0.92; }
      if (mesh.current.position.z > bounds.maxZ) { mesh.current.position.z = bounds.maxZ; vel.current.z *= -0.92; }

      // slight damping
      vel.current.multiplyScalar(0.999);

      // if hovered, slight scale pulse
      if (hovered.current) {
        mesh.current.scale.lerp(new THREE.Vector3(scale * 1.12, scale * 1.12, scale * 1.12), Math.min(0.08 * delta * 60, 0.2));
      } else {
        mesh.current.scale.lerp(new THREE.Vector3(scale, scale, scale), Math.min(0.06 * delta * 60, 0.2));
      }
    } else {
      // when dragging, follow pointer
      mesh.current.rotation.x += 0.02;
      mesh.current.rotation.y += 0.03;
    }

    // slowly lerp color toward target if provided
    if (targetThree.current) {
      matRef.current.color.lerp(targetThree.current, Math.min(0.02 * (delta * 60), 0.05));
    }

    // modify emissive when hovered for sparkle effect
    const emissiveTarget = hovered.current ? 0.35 : 0.0;
    if (matRef.current) matRef.current.emissiveIntensity = THREE.MathUtils.lerp(matRef.current.emissiveIntensity || 0, emissiveTarget, 0.04);
  });

  // expose click bridge for external raycasts
  useEffect(() => {
    if (mesh.current) {
      (mesh.current as any).userData._onExternalClick = (payload: any) => {
        try {
          onClick(payload);
        } catch (err) {
          // ignore
        }
      };
    }
  }, [mesh.current]);

  // handlers use r3f event which provides event.point in world coords
  function onPointerDown(e: any) {
    e.stopPropagation();
    dragging.current = true;
    offset.current.subVectors(mesh.current!.position, e.point);
    document.body.style.cursor = "grabbing";
  }

  function onPointerMove(e: any) {
    e.stopPropagation();
    if (!dragging.current) return;
    const target = e.point.clone().add(offset.current);
    mesh.current!.position.lerp(target, 0.25);
  }

  function onPointerUp(e: any) {
    e.stopPropagation();
    const wasDragging = dragging.current;
    dragging.current = false;
    document.body.style.cursor = "default";
    mesh.current!.scale.setScalar(scale);
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
    const clientX = e.clientX ?? 0;
    const clientY = e.clientY ?? 0;
    const confetti = (window as any).__fireConfetti;
    if (typeof confetti === "function") confetti();
    spawnSmiley(clientX, clientY);

    // make shape fly away in a new direction
    try {
      // direction biased away from center plus randomness
      if (mesh.current) {
        const dir = mesh.current.position.clone().normalize().add(new THREE.Vector3((Math.random()-0.5)*0.6, (Math.random()-0.5)*0.6, (Math.random()-0.5)*0.6)).normalize();
        const strength = 1.1 + Math.random() * 0.8;
        vel.current.copy(dir.multiplyScalar(strength));
      }
    } catch (err) {
      // fallback impulse
      vel.current.add(new THREE.Vector3((Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.2));
    }

    // spawn sparkle particles at mesh location
    try {
      const spawn = (window as any).__spawnParticles;
      if (typeof spawn === 'function' && mesh.current) {
        spawn({ x: mesh.current.position.x, y: mesh.current.position.y, z: mesh.current.position.z }, 'hsl(var(--joy-yellow))', 16);
      }
    } catch (err) {
      // ignore
    }

    // color flash
    if (matRef.current) {
      const prev = matRef.current.color.clone();
      try {
        const el = document.createElement('div');
        el.style.color = 'hsl(var(--joy-yellow))';
        document.body.appendChild(el);
        const comp = getComputedStyle(el).color;
        document.body.removeChild(el);
        matRef.current.color = new THREE.Color(comp);
        setTimeout(() => { if (matRef.current) matRef.current.color.lerp(prev, 0.95); }, 350);
      } catch (err) {
        // ignore
      }
    }
  }

  // return different geometries based on shape
  function geometryByShape() {
    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[0.9, 32, 32]} />;
      case 'box':
        return <boxGeometry args={[1.4, 1.4, 1.4]} />;
      case 'torus':
        return <torusGeometry args={[0.7, 0.25, 16, 60]} />;
      case 'octa':
        return <octahedronGeometry args={[0.9, 0]} />;
      case 'tetra':
        return <tetrahedronGeometry args={[0.95, 0]} />;
      default:
        return <icosahedronGeometry args={[0.9, 1]} />;
    }
  }

  return (
    <Float speed={0.6} rotationIntensity={0.6} floatIntensity={0.2}>
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
        castShadow={false}
        receiveShadow={false}
      >
        {geometryByShape()}
        <meshStandardMaterial ref={((r:any)=> (matRef.current = r))} color={color} roughness={0.45} metalness={0.05} transparent opacity={0.85} emissive={'#ffffff'} emissiveIntensity={0} />
      </mesh>
    </Float>
  );
}

function InteractionBridge() {
  const { camera, scene, gl } = useThree();
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const handler = (e: PointerEvent) => {
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
          } catch (err) {
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

export function Background3D() {
  const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fireConfetti = useConfetti();

  // expose confetti globally for three event handlers (simple bridge)
  (window as any).__fireConfetti = fireConfetti;

  if (prefersReduced) {
    // Render an accessible static gradient fallback for users who prefer reduced motion
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, hsla(var(--joy-mint), 0.12), hsla(var(--joy-sky), 0.14))`,
            backdropFilter: "blur(8px)",
          }}
        />
      </div>
    );
  }

  const shapeChoices = ['icosa','sphere','box','torus','octa','tetra'];

  // generate a denser base set of shapes for a fuller no-gravity scene
  const baseBlobs = useMemo(() => {
    const palette = ["hsl(var(--joy-mint))","hsl(var(--joy-sky))","hsl(var(--primary))","hsl(var(--joy-lavender))","hsl(var(--joy-peach))"];
    return Array.from({ length: 22 }).map((_, i) => {
      const id = makeId('base-');
      const color = palette[i % palette.length];
      const shape = shapeChoices[i % shapeChoices.length];
      const position: [number, number, number] = [ (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 5, -0.5 - Math.random() * 4.5 ];
      const scale = 0.5 + Math.random() * 1.6;
      return { id, color, position, scale, shape };
    });
  }, []);

  const [extraBlobs, setExtraBlobs] = useState<Array<{id:string;color:string;position:[number,number,number];scale:number;shape?:string;targetColor?:string;}>>([]);
  const MAX_EXTRA = 28;

  // ambient spawner keeps the scene lively up to a cap
  useEffect(() => {
    const id = setInterval(() => {
      setExtraBlobs((s) => {
        if (s.length >= MAX_EXTRA) return s;
        const toCreate = Math.min(4, MAX_EXTRA - s.length);
        const palette = ["hsl(var(--joy-mint))","hsl(var(--joy-sky))","hsl(var(--primary))","hsl(var(--joy-lavender))","hsl(var(--joy-peach))"];
        const created: Array<{id:string;color:string;position:[number,number,number];scale:number;shape?:string;targetColor?:string;}> = [];
        for (let i = 0; i < toCreate; i++) {
          const id = makeId('ambient-');
          const shape = shapeChoices[Math.floor(Math.random() * shapeChoices.length)];
          const color = palette[Math.floor(Math.random() * palette.length)];
          const targetColor = palette[(Math.floor(Math.random() * palette.length) + 1) % palette.length];
          const position: [number, number, number] = [(Math.random() - 0.5) * 6, (Math.random() - 0.4) * 4, -0.5 - Math.random() * 4];
          const scale = 0.4 + Math.random() * 1.1;
          created.push({ id, color, position, scale, targetColor, shape });
        }
        // schedule cleanup of these ambient created blobs
        setTimeout(() => {
          setExtraBlobs((cur) => cur.filter((b) => !created.some((c) => c.id === b.id)));
        }, 6000 + Math.random() * 2000);
        return [...s, ...created];
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // particles for click sparkles
  const [particles, setParticles] = useState<Array<{id:string;pos:[number,number,number];vel:[number,number,number];life:number;ttl:number;color:string}>>([]);

  function spawnParticlesAt(posVec: THREE.Vector3, color = 'hsl(var(--joy-yellow))', count = 12) {
    const created: typeof particles = [];
    const base = posVec.clone();
    for (let i = 0; i < count; i++) {
      const id = makeId('part-');
      const dir = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize();
      const speed = 1 + Math.random() * 2.2;
      const vel = [dir.x * speed * 1.6, dir.y * speed * 1.6, dir.z * speed * 1.6] as [number,number,number];
      const life = 0;
      const ttl = 0.9 + Math.random() * 0.8;
      created.push({ id, pos: [base.x, base.y, base.z], vel, life, ttl, color });
    }
    setParticles((s) => [...s, ...created]);
  }

  useEffect(() => {
    (window as any).__spawnParticles = (p:{x:number,y:number,z?:number}, color?:string, count = 12) => {
      const vec = new THREE.Vector3(p.x, p.y, (p.z ?? -1));
      spawnParticlesAt(vec, color, count);
    };
  }, []);

  // API to spawn ephemeral blobs (used by Celebrate action)
  useEffect(() => {
    (window as any).__spawnBlobs = ({ count = 8, palette = ["hsl(var(--joy-mint))","hsl(var(--joy-sky))"] } = {}) => {
      const created: Array<{id:string;color:string;position:[number,number,number];scale:number;shape?:string;targetColor?:string;}> = [];
      for (let i = 0; i < count; i++) {
        const id = makeId('spawn-');
        const t = i / Math.max(1, count - 1);
        // choose shape randomly
        const shape = shapeChoices[Math.floor(Math.random() * shapeChoices.length)];
        // alternate start color but set targetColor to create a green->blue transition
        const color = palette[Math.floor(Math.random() * palette.length)];
        const targetColor = palette[(Math.floor(Math.random() * palette.length) + 1) % palette.length];
        const position: [number, number, number] = [(Math.random() - 0.5) * 4.5, (Math.random() - 0.4) * 3, -0.5 - Math.random() * 3];
        const scale = 0.5 + Math.random() * 1.2;
        created.push({ id, color, position, scale, targetColor, shape });
      }
      setExtraBlobs((s) => [...s, ...created]);
      // cleanup after TTL
      setTimeout(() => {
        setExtraBlobs((s) => s.filter((b) => !created.some((c) => c.id === b.id)));
      }, 4500);
    };
  }, []);

  interface Particle {
    id: string;
    pos: [number, number, number];
    vel: [number, number, number];
    life: number;
    ttl: number;
    color: string;
  }

  function ParticleSystem({ particles, setParticles }: { particles: Particle[]; setParticles: React.Dispatch<React.SetStateAction<Particle[]>> }) {
    const groupRef = useRef<THREE.Group | null>(null);

    useFrame((state, delta) => {
      if (!particles.length) return;

      setParticles((prev: Particle[]): Particle[] => {
        const next: Particle[] = [];
        for (const p of prev) {
          p.life += delta;
          const lifeRatio = p.life / p.ttl;
          if (lifeRatio >= 1) continue;
          // update position
          p.pos = [p.pos[0] + p.vel[0] * delta, p.pos[1] + p.vel[1] * delta, p.pos[2] + p.vel[2] * delta];
          // apply slight drag
          p.vel = [p.vel[0] * (1 - delta * 0.5), p.vel[1] * (1 - delta * 0.5), p.vel[2] * (1 - delta * 0.5)];
          next.push(p);
        }
        return next;
      });
    });

    return (
      <group ref={groupRef}>
        {particles.map((p: Particle) => {
          const opacity: number = Math.max(0, 1 - p.life / p.ttl);
          return (
        <mesh key={p.id} position={p.pos as [number, number, number]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={p.color} transparent opacity={opacity} emissive={p.color} emissiveIntensity={0.8} />
        </mesh>
          );
        })}
      </group>
    );
  }

  useEffect(() => {
    console.log("Background3D mounted", { prefersReduced, baseCount: baseBlobs.length });
  }, []);

  useEffect(() => {
    // debug canvas presence and size
    setTimeout(() => {
      const canv = document.querySelector('canvas');
      if (canv) {
        console.log('Background3D canvas found', { width: canv.getAttribute('width'), height: canv.getAttribute('height'), style: canv.getAttribute('style') });
      } else {
        console.log('Background3D canvas NOT found');
      }
    }, 500);
  }, []);

  return (
    <div aria-hidden className="pointer-events-auto fixed inset-0 z-0">
      <R3Canvas camera={{ position: [0, 0, 6], fov: 60 }} style={{ pointerEvents: "auto", width: '100%', height: '100%', position: 'absolute', inset: 0, background: 'transparent' }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        {baseBlobs.map((b) => (
          <Blob key={b.id} id={b.id} color={b.color} position={b.position as [number, number, number]} scale={b.scale} speedFactor={0.45} shape={b.shape} />
        ))}
        {extraBlobs.map((b) => (
          <Blob key={b.id} id={b.id} color={b.color} position={b.position} scale={b.scale} speedFactor={0.32} targetColor={b.targetColor} shape={b.shape} />
        ))}
        <InteractionBridge />
        <ParticleSystem particles={particles} setParticles={setParticles} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </R3Canvas>
    </div>
  );
}
