import React, { useEffect, useRef } from "react";

type Particle = { x: number; y: number; life: number; ttl: number; size: number; hue: number };

export default function SketchCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return; // don't add trail if reduced motion

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    function getColorMix() {
      // mix joy-mint and joy-sky for blue-green hues
      try {
        const cs = getComputedStyle(document.documentElement);
        const mint = cs.getPropertyValue("--joy-mint").trim();
        const sky = cs.getPropertyValue("--joy-sky").trim();
        // fallback hues
        const h1 = mint ? 165 : 190;
        const h2 = sky ? 200 : 195;
        return { h1, h2 };
      } catch (e) {
        return { h1: 165, h2: 200 };
      }
    }

    const hues = getColorMix();

    function spawnAt(x: number, y: number, click = false) {
      const now = performance.now();
      const last = lastRef.current;
      const dist = last ? Math.hypot(x - last.x, y - last.y) : 0;
      lastRef.current = { x, y, t: now };
      const count = click ? 8 : Math.min(6, 1 + Math.floor(dist / 8));
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = (Math.random() * (click ? 8 : 6)) + (dist > 12 ? 2 : 0);
        const px = x + Math.cos(angle) * r + (Math.random() - 0.5) * 4;
        const py = y + Math.sin(angle) * r + (Math.random() - 0.5) * 4;
        particlesRef.current.push({
          x: px,
          y: py,
          life: 0,
          ttl: 700 + Math.random() * 900,
          size: (click ? 6 : (2 + Math.random() * 4)),
          hue: hues.h1 + Math.random() * (hues.h2 - hues.h1),
        });
      }
    }

    let lastMove = 0;
    function onPointerMove(e: PointerEvent) {
      // throttle
      const now = performance.now();
      if (now - lastMove < 16) return;
      lastMove = now;
      spawnAt(e.clientX, e.clientY, false);
    }

    function onPointerDown(e: PointerEvent) {
      spawnAt(e.clientX, e.clientY, true);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);

    function loop() {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();
      const next: Particle[] = [];
      // draw each particle as a sketched circle with slight line
      for (const p of particlesRef.current) {
        p.life += 16; // approximate frame delta for aging
        const t = p.life / p.ttl;
        if (t >= 1) continue;
        const alpha = 1 - t;
        const size = p.size * (0.6 + 0.4 * (1 - t));
        ctx.beginPath();
        // sketchy ring: draw few jittered arcs
        for (let k = 0; k < 3; k++) {
          const jitterX = (Math.random() - 0.5) * 0.6 * size;
          const jitterY = (Math.random() - 0.5) * 0.6 * size;
          ctx.moveTo(p.x + jitterX + size, p.y + jitterY);
          ctx.arc(p.x + jitterX, p.y + jitterY, size, 0, Math.PI * 2);
        }
        ctx.closePath();
        ctx.fillStyle = `hsla(${p.hue.toFixed(1)}, 80%, 55%, ${0.12 * alpha})`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${p.hue.toFixed(1)}, 95%, 35%, ${0.6 * alpha})`;
        ctx.lineWidth = Math.max(0.8, 1.2 * (1 - t));
        ctx.stroke();
        next.push(p);
      }
      particlesRef.current = next;
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return null;
}
