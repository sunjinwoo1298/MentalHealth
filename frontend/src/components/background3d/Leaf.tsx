import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Float, useFrame } from '@react-three/drei';
import { LeafProps } from './types';
import { WORLD_BOUNDS } from './constants';

export function Leaf({ id, color, position, scale = 1, targetColor, shape = 'maple', texture }: LeafProps) {
  const mesh = useRef<THREE.Mesh | null>(null);
  const matRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const dragging = useRef(false);
  const offset = useRef(new THREE.Vector3());
  // Slightly faster downward velocity & gentler horizontal/forward motion for realism
  const vel = useRef(new THREE.Vector3((Math.random()-0.5)*0.12, -0.09 - Math.random()*0.12, (Math.random()-0.5)*0.06));
  const targetThree = useRef<THREE.Color | null>(null);
  const hovered = useRef(false);
  const prevTimeRef = useRef<number | null>(null);
  const wobblePhase = useRef(Math.random() * Math.PI * 2);
  const wobbleSpeed = useRef(0.5 + Math.random() * 0.5);
  const wobbleAmplitude = useRef(0.25 + Math.random() * 0.3);

  const seed = useMemo(() => {
    let n = 0; for (let i=0;i<id.length;i++) n = (n*31 + id.charCodeAt(i))>>>0; return n % 10000;
  }, [id]);

  useEffect(()=>{
    if (!matRef.current || typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.style.color = color; document.body.appendChild(el);
    const computed = getComputedStyle(el).color; document.body.removeChild(el);
    matRef.current.color = new THREE.Color(computed);
    if (targetColor) {
      const el2 = document.createElement('div'); el2.style.color = targetColor; document.body.appendChild(el2);
      const comp2 = getComputedStyle(el2).color; document.body.removeChild(el2);
      targetThree.current = new THREE.Color(comp2);
    }
  }, [color, targetColor]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const prev = prevTimeRef.current ?? t; const delta = t - prev; prevTimeRef.current = t;
    if (!mesh.current || !matRef.current) return;
    if (!dragging.current) {
      const wobble = Math.sin(t * wobbleSpeed.current + wobblePhase.current) * wobbleAmplitude.current;
      mesh.current.position.x += (vel.current.x + wobble * 0.15) * delta;
      mesh.current.position.y += vel.current.y * delta;
      mesh.current.position.z += vel.current.z * delta;

  const baseSpeed = 0.0006 + (hovered.current ? 0.0025 : 0.0004);
      mesh.current.rotation.x += baseSpeed * (0.6 + Math.sin(t * 0.5 + seed*0.001)*0.5);
      mesh.current.rotation.y += baseSpeed * (1.2 + Math.cos(t * 0.4 + seed*0.001)*0.8);
      mesh.current.rotation.z += baseSpeed * (0.4 + Math.sin(t * 0.3 + seed*0.001)*0.6) * wobble;

      if (mesh.current.position.y < WORLD_BOUNDS.minY) {
        mesh.current.position.y = WORLD_BOUNDS.maxY;
        mesh.current.position.x = (Math.random()-0.5) * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX);
        mesh.current.position.z = WORLD_BOUNDS.minZ + Math.random() * (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ);
  vel.current.x = (Math.random()-0.5)*0.12; vel.current.y = -0.09 - Math.random()*0.12; wobblePhase.current = Math.random()*Math.PI*2;
      }
      if (mesh.current.position.x < WORLD_BOUNDS.minX) mesh.current.position.x = WORLD_BOUNDS.maxX;
      if (mesh.current.position.x > WORLD_BOUNDS.maxX) mesh.current.position.x = WORLD_BOUNDS.minX;
      if (mesh.current.position.z < WORLD_BOUNDS.minZ) { mesh.current.position.z = WORLD_BOUNDS.minZ; vel.current.z *= -0.5; }
      if (mesh.current.position.z > WORLD_BOUNDS.maxZ) { mesh.current.position.z = WORLD_BOUNDS.maxZ; vel.current.z *= -0.5; }
      vel.current.multiplyScalar(Math.max(0, 1 - 0.0005 * (delta * 60)));
      mesh.current.scale.lerp(new THREE.Vector3(hovered.current ? scale*1.08 : scale, hovered.current ? scale*1.08 : scale, hovered.current ? scale*1.08 : scale), Math.min(0.06 * delta * 60, 0.15));
    } else {
      mesh.current.rotation.x += 0.02; mesh.current.rotation.y += 0.03;
    }
    if (targetThree.current) matRef.current.color.lerp(targetThree.current, Math.min(0.02 * (delta * 60), 0.05));
    const emissiveTarget = hovered.current ? 0.2 : 0.05;
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(matRef.current.emissiveIntensity || 0, emissiveTarget, 0.03);
  });

  function onPointerDown(e:any){ e.stopPropagation(); dragging.current = true; if(mesh.current && e.point){ offset.current.subVectors(mesh.current.position, e.point);} if(typeof document!=='undefined') document.body.style.cursor='grabbing'; }
  function onPointerMove(e:any){ e.stopPropagation(); if(!dragging.current || !mesh.current || !e.point) return; const target = e.point.clone().add(offset.current); mesh.current.position.lerp(target,0.25);} 
  function onPointerUp(e:any){ e.stopPropagation(); const was = dragging.current; dragging.current = false; if(typeof document!=='undefined') document.body.style.cursor='default'; if(mesh.current) mesh.current.scale.setScalar(scale); if(!was) return; }
  function onPointerOver(e:any){ e.stopPropagation(); hovered.current = true; }
  function onPointerOut(e:any){ e.stopPropagation(); hovered.current = false; }
  function onClick(e:any){ e.stopPropagation(); const confetti = (typeof window !== 'undefined' ? (window as any).__fireConfetti : undefined); if (typeof confetti==='function') confetti(); if (mesh.current){ try { const dir = mesh.current.position.clone().normalize().add(new THREE.Vector3((Math.random()-0.5)*0.6,(Math.random()-0.5)*0.6,(Math.random()-0.5)*0.6)).normalize(); vel.current.copy(dir.multiplyScalar(1.1 + Math.random()*0.8)); } catch { vel.current.add(new THREE.Vector3((Math.random()-0.5)*2.2,(Math.random()-0.5)*1.8,(Math.random()-0.5)*1.2)); } } }

  function geometryByShape(){
    switch(shape){
      case 'maple': return <planeGeometry args={[1.2,1.2,4,4]} />;
      case 'oak': return <planeGeometry args={[0.9,1.3,4,4]} />;
      case 'birch': return <planeGeometry args={[0.8,1.1,4,4]} />;
      case 'ginkgo': return <planeGeometry args={[1.1,1.0,4,4]} />;
      case 'willow': return <planeGeometry args={[0.5,1.4,4,4]} />;
      default: return <planeGeometry args={[1.0,1.2,4,4]} />;
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
        castShadow
      >
        {geometryByShape()}
        <meshStandardMaterial
          ref={(r:any)=>{ matRef.current = r ?? null; }}
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
