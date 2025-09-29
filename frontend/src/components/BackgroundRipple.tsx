import { useEffect, useRef } from "react";

export default function BackgroundRipple() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const ripplesRef = useRef<Array<any>>([]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    // place above 3D background but below main UI
    canvas.style.zIndex = '0';
    canvasRef.current = canvas;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(h * devicePixelRatio));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      if (ctx) ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();
      // draw slightly bolder background gradient to blend blue-green
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, `rgba(${getCSSRGB('--joy-mint')}, 0.12)`);
      bg.addColorStop(0.5, `rgba(${getCSSRGB('--joy-mint')}, 0.06)`);
      bg.addColorStop(1, `rgba(${getCSSRGB('--joy-sky')}, 0.14)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // update ripples
      ripplesRef.current = ripplesRef.current.filter(r => r.age < r.ttl);
      ripplesRef.current.forEach(r => {
        const t = (now - r.start) / r.ttl;
        r.age = now - r.start;
        const eased = easeOutCubic(Math.min(1, t));
        const radius = r.maxRadius * eased;
        const alpha = Math.max(0, 1 - t);

        // richer radial gradient for bolder visual
        const grad = ctx.createRadialGradient(r.x, r.y, Math.max(2, radius * 0.04), r.x, r.y, radius);
        grad.addColorStop(0, `rgba(${r.rgbaStart}, ${0.85 * alpha})`);
        grad.addColorStop(0.4, `rgba(${r.rgbaStart}, ${0.35 * alpha})`);
        grad.addColorStop(0.75, `rgba(${r.rgbaEnd}, ${0.18 * alpha})`);
        grad.addColorStop(1, `rgba(${r.rgbaEnd}, ${0.06 * alpha})`);

        ctx.beginPath();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad;
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // subtle ring outline that fades
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = `rgba(${r.rgbaEnd}, ${0.12 * alpha})`;
        ctx.lineWidth = Math.max(1, 6 * (1 - eased));
        ctx.arc(r.x, r.y, radius * 0.98, 0, Math.PI * 2);
        ctx.stroke();
      });

      rafRef.current = requestAnimationFrame(loop);
    }

    if (!prefersReduced) rafRef.current = requestAnimationFrame(loop);

    function spawnRipple(clientX: number, clientY: number) {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const maxRadius = Math.max(w, h) * (0.25 + Math.random() * 0.35);
      // read CSS var colors and convert to r,g,b
      const startRGB = getCSSRGB('--joy-red');
      const endRGB = getCSSRGB('--joy-sky');
      const ripple = {
        x,
        y,
        start: performance.now(),
        age: 0,
        ttl: 1300 + Math.random() * 1000,
        maxRadius,
        rgbaStart: startRGB,
        rgbaEnd: endRGB,
      };
      ripplesRef.current.push(ripple);
    }

    // expose to window for programmatic triggers
    (window as any).__spawnRipple = (p: { x: number; y: number } | { clientX: number; clientY: number }) => {
      const cx = (p as any).x ?? (p as any).clientX ?? 0;
      const cy = (p as any).y ?? (p as any).clientY ?? 0;
      spawnRipple(cx, cy);
    };

    // listen globally for pointerdown to spawn ripples
    const handler = (e: PointerEvent) => {
      // avoid when clicking interactive controls
      const tag = (e.target as HTMLElement)?.closest?.('button, a, input, textarea, [role="button"]');
      if (tag) return;
      spawnRipple(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handler);

    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (canvasRef.current && canvasRef.current.parentNode) canvasRef.current.parentNode.removeChild(canvasRef.current);
    };
  }, []);

  return null;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
}

function getCSSRGB(varName: string) {
  try {
    const s = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!s) return '180,230,220';
    // supports HSL like "160 60% 80%" used with hsl(var(--...)) earlier; convert HSL to RGB approximately by using temporary element
    const el = document.createElement('div');
    el.style.color = `hsl(${s})`;
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);
    // computed = 'rgb(r, g, b)'
    const m = computed.match(/\d+/g);
    if (!m) return '180,230,220';
    return `${m[0]}, ${m[1]}, ${m[2]}`;
  } catch (e) {
    return '180,230,220';
  }
}
