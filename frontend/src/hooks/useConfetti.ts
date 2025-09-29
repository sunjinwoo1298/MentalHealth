import { useCallback } from "react";

export function useConfetti() {
  return useCallback(() => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    const colors = [
      "hsl(var(--joy-pink))",
      "hsl(var(--joy-sky))",
      "hsl(var(--joy-mint))",
      "hsl(var(--joy-lavender))",
      "hsl(var(--joy-peach))",
      "hsl(var(--joy-yellow))",
    ];

    const count = 80;
    for (let i = 0; i < count; i++) {
      const conf = document.createElement("span");
      const size = 6 + Math.random() * 8;
      conf.style.position = "absolute";
      conf.style.width = `${size}px`;
      conf.style.height = `${size}px`;
      conf.style.borderRadius = Math.random() > 0.5 ? "50%" : "6px";
      conf.style.background = colors[i % colors.length];
      conf.style.left = `${Math.random() * 100}%`;
      conf.style.top = `-10px`;
      conf.style.transform = `translate3d(0,0,0)`;
      conf.style.opacity = "0.9";
      conf.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";

      const duration = 1500 + Math.random() * 1500;
      const translateY = 100 + Math.random() * 120;
      conf.animate(
        [
          { transform: `translate3d(0, -20px, 0) rotate(0deg)`, opacity: 0 },
          { transform: `translate3d(${(Math.random() - 0.5) * 80}px, ${translateY}vh, 0) rotate(${Math.random() * 720 - 360}deg)`, opacity: 1 },
        ],
        { duration, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" },
      );
      container.appendChild(conf);
    }

    setTimeout(() => container.remove(), 3200);
  }, []);
}
