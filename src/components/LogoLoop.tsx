"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type LogoItem = {
  src: string;
  alt?: string;
  title?: string;
  href?: string;
};

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  logoHeight?: number;
  gap?: number;
  fadeOut?: boolean;
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function LogoLoop({
  logos,
  speed = 42,
  logoHeight = 30,
  gap = 40,
  fadeOut = true,
  scaleOnHover = true,
  ariaLabel = "Registered tools",
  className,
}: LogoLoopProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const sequence = sequenceRef.current;
    if (!track || !sequence || logos.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let previous = performance.now();
    let offset = 0;
    let cycleWidth = 0;

    const measure = () => {
      // One cycle is one sequence plus the gap before its identical successor.
      cycleWidth = sequence.getBoundingClientRect().width + gap;
      if (cycleWidth > 0) offset %= cycleWidth;
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(sequence);
    measure();

    const animate = (now: number) => {
      const delta = Math.min(now - previous, 64) / 1000;
      previous = now;
      if (cycleWidth > 0) {
        offset = (offset + speed * delta) % cycleWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [gap, logos.length, speed]);

  const renderLogo = (logo: LogoItem, index: number, duplicate: boolean) => {
    const image = (
      <img
        src={logo.src}
        alt={duplicate ? "" : logo.alt ?? logo.title ?? ""}
        title={logo.title}
        width={logoHeight}
        height={logoHeight}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn(
          "block rounded-md object-contain grayscale opacity-70 transition duration-300 hover:grayscale-0 hover:opacity-100",
          scaleOnHover && "hover:scale-110",
        )}
        style={{ width: logoHeight, height: logoHeight }}
      />
    );

    return (
      <div key={`${logo.title ?? logo.src}-${index}`} className="flex-none">
        {!duplicate && logo.href ? (
          <a href={logo.href} target="_blank" rel="noreferrer noopener" aria-label={logo.title}>
            {image}
          </a>
        ) : image}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        fadeOut && "[mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]",
        className,
      )}
      role="region"
      aria-label={ariaLabel}
    >
      <div ref={trackRef} className="flex w-max items-center" style={{ gap }}>
        <div ref={sequenceRef} className="flex flex-none items-center" style={{ gap }}>
          {logos.map((logo, index) => renderLogo(logo, index, false))}
        </div>
        <div className="flex flex-none items-center" style={{ gap }} aria-hidden="true">
          {logos.map((logo, index) => renderLogo(logo, index, true))}
        </div>
        <div className="flex flex-none items-center" style={{ gap }} aria-hidden="true">
          {logos.map((logo, index) => renderLogo(logo, index, true))}
        </div>
      </div>
    </div>
  );
}
