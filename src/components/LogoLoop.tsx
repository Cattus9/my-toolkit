"use client";

import { useEffect, useRef, useState } from "react";
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
  gap?: number;
  maxVisible?: number;
  fadeOut?: boolean;
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function LogoLoop({
  logos,
  speed = 42,
  gap = 32,
  maxVisible = 16,
  fadeOut = true,
  scaleOnHover = true,
  ariaLabel = "Registered tools",
  className,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const [copyCount, setCopyCount] = useState(2);
  const [logoHeight, setLogoHeight] = useState(30);
  const logoSignature = logos.map((logo) => logo.src).join("\u0000");
  const [gapBetween, setGapBetween] = useState(gap);

  useEffect(() => {
    const container = containerRef.current;
    const sequence = sequenceRef.current;
    if (!container || !sequence || logos.length === 0) return;
    const updateCopies = () => {
      const viewportWidth = container.clientWidth;
      const pitch = viewportWidth / Math.max(1, maxVisible - 1);
      const nextGap = Math.min(gap, Math.max(4, Math.round(pitch * 0.4)));
      const nextLogoHeight = Math.max(18, Math.min(72, Math.round(pitch - nextGap)));
      setGapBetween((current) => current === nextGap ? current : nextGap);
      setLogoHeight((current) => current === nextLogoHeight ? current : nextLogoHeight);
      const sequenceWidth = sequence.getBoundingClientRect().width;
      if (!sequenceWidth) return;
      const cycleWidth = sequenceWidth + nextGap;
      const count = Math.max(2, Math.ceil(viewportWidth / cycleWidth) + 2);
      setCopyCount((current) => current === count ? current : count);
    };

    const observer = new ResizeObserver(updateCopies);
    observer.observe(container);
    observer.observe(sequence);
    updateCopies();
    return () => observer.disconnect();
  }, [gap, logoSignature, maxVisible]);

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
      cycleWidth = sequence.getBoundingClientRect().width + gapBetween;
      if (cycleWidth > 0) offset %= cycleWidth;
    };

    const observer = new ResizeObserver(measure);
    observer.observe(sequence);
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
      observer.disconnect();
    };
  }, [gapBetween, logoSignature, speed]);

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
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={fadeOut ? {
        maskImage: "linear-gradient(to right, transparent 0, black clamp(24px, 4vw, 60px), black calc(100% - clamp(24px, 4vw, 60px)), transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0, black clamp(24px, 4vw, 60px), black calc(100% - clamp(24px, 4vw, 60px)), transparent 100%)",
      } : undefined}
      role="region"
      aria-label={ariaLabel}
    >
      <div ref={trackRef} className="flex w-max items-center" style={{ gap: gapBetween }}>
        {Array.from({ length: copyCount }, (_, copyIndex) => (
          <div
            key={copyIndex}
            ref={copyIndex === 0 ? sequenceRef : undefined}
            className="flex flex-none items-center"
            style={{ gap: gapBetween }}
            aria-hidden={copyIndex > 0 ? true : undefined}
          >
            {logos.map((logo, index) => renderLogo(logo, index, copyIndex > 0))}
          </div>
        ))}
      </div>
    </div>
  );
}
