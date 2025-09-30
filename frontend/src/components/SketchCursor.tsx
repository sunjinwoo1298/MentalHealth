import React, { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  life: number;
  ttl: number;
  size: number;
  rotation: number;
};

export default function SketchCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const cursorEl = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Hide system cursor
    document.body.style.cursor = "none";

    // Custom PNG cursor element
    const cursor = document.createElement("img");
    cursor.src = "./cursor.png"; // 👉 replace with your PNG path
    cursor.style.position = "fixed";
    cursor.style.width = "24px";
    cursor.style.height = "24px";
    cursor.style.pointerEvents = "none";
    cursor.style.transform = "translate(-50%, -50%)";
    cursor.style.zIndex = "10000";
    document.body.appendChild(cursor);
    cursorEl.current = cursor;

    // Particle canvas
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
    let w = 0,
      h = 0;

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

    function spawnAt(x: number, y: number, burst = false) {
      const now = performance.now();
      const last = lastRef.current;
      const dist = last ? Math.hypot(x - last.x, y - last.y) : 0;
      lastRef.current = { x, y, t: now };
      const count = burst ? 12 : Math.min(6, 1 + Math.floor(dist / 6));
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          life: 0,
          ttl: 600 + Math.random() * 600,
          size: 2 + Math.random() * 4,
          rotation: Math.random() * Math.PI * 2,
        });
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (cursorEl.current) {
        cursorEl.current.style.left = `${e.clientX}px`;
        cursorEl.current.style.top = `${e.clientY}px`;
      }
      spawnAt(e.clientX, e.clientY);
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

      // smooth hue cycling between red-orange-yellow
      const hueBase = 30 + 30 * Math.sin(now / 1000); // oscillates 0–60

      for (const p of particlesRef.current) {
        p.life += 16;
        const t = p.life / p.ttl;
        if (t >= 1) continue;

        const alpha = 1 - t;
        const size = p.size * (0.5 + 0.5 * (1 - t));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1 + Math.sin(t * Math.PI * 2) * 0.2, 1);

        // sparkle star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5;
          const r = size * (i % 2 === 0 ? 1.8 : 0.6);
          ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();

        ctx.fillStyle = `hsla(${hueBase}, 100%, 60%, ${0.8 * alpha})`;
        ctx.shadowColor = `hsla(${hueBase}, 100%, 70%, ${0.9 * alpha})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

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
      if (cursorEl.current && cursorEl.current.parentNode)
        cursorEl.current.parentNode.removeChild(cursorEl.current);
      document.body.style.cursor = ""; // reset default cursor
    };
  }, []);

  return null;
}
