import React, { useState, useMemo } from "react";

// Cute floating small bubble item
function SingleBubble({ id, left, size, duration, delay, sway, opacity, hasHeart, onPop }) {
  const [popped, setPopped] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setPopped(true);
    onPop?.();
  };

  if (popped) {
    return (
      <div
        className="absolute pointer-events-none text-xs animate-ping"
        style={{
          left: `${left}%`,
          bottom: "40%",
        }}
      >
        ✨
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="absolute rounded-full cursor-pointer transition-transform hover:scale-125 select-none pointer-events-auto"
      style={{
        left: `${left}%`,
        bottom: "-40px",
        width: `${size}px`,
        height: `${size}px`,
        opacity: opacity,
        animation: `bubbleFloat ${duration}s ease-in-out ${delay}s infinite, bubbleSway ${sway}s ease-in-out infinite alternate`,
        background:
          "radial-gradient(circle at 32% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 220, 235, 0.65) 30%, rgba(244, 114, 182, 0.45) 70%, rgba(236, 72, 153, 0.75) 100%)",
        boxShadow:
          "inset 0 0 4px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(244, 114, 182, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(0.5px)",
      }}
      title="Pop me! 💕"
    >
      {/* Specular glare dot */}
      <span
        className="absolute rounded-full bg-white pointer-events-none"
        style={{
          width: `${Math.max(2, size * 0.22)}px`,
          height: `${Math.max(2, size * 0.22)}px`,
          top: "18%",
          left: "22%",
          boxShadow: "0 0 2px rgba(255, 255, 255, 0.9)",
        }}
      />
      {hasHeart && (
        <span
          className="absolute inset-0 flex items-center justify-center text-[9px] pointer-events-none"
          style={{ transform: "scale(0.85)" }}
        >
          💖
        </span>
      )}
    </div>
  );
}

export function CuteBubbleRain() {
  const bubbleCount = 32;

  // Generate deterministic-looking yet organic bubble specs
  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, i) => {
      const size = 11 + Math.round((i * 7) % 16); // 11px to 27px (cute and small)
      const left = ((i * 3.14 * 17) % 96) + 2; // distributed across width
      const duration = 7 + ((i * 3) % 6); // 7s to 12s float time
      const delay = (i * 0.38) % 8; // staggered launch
      const sway = 2.5 + ((i * 1.5) % 3); // horizontal wobble cycle
      const opacity = 0.55 + ((i * 0.1) % 0.4);
      const hasHeart = i % 5 === 0; // occasional tiny heart bubble

      return {
        id: `bubble-${i}`,
        left,
        size,
        duration,
        delay,
        sway,
        opacity,
        hasHeart,
      };
    });
  }, [bubbleCount]);

  return (
    <>
      <style>{`
        @keyframes bubbleFloat {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(-115vh) scale(1.05);
            opacity: 0;
          }
        }

        @keyframes bubbleSway {
          0% {
            margin-left: -12px;
          }
          100% {
            margin-left: 14px;
          }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden select-none"
        style={{ perspective: "1000px" }}
      >
        {bubbles.map((b) => (
          <SingleBubble key={b.id} {...b} />
        ))}
      </div>
    </>
  );
}

export default CuteBubbleRain;
