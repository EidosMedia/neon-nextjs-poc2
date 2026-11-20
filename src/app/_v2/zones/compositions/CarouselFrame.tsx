'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const AUTOPLAY_MS = 6000;

/**
 * Client part of the carousel: it finds the server-rendered track inside its own wrapper, keeps the active
 * slide in sync with the scroll position, draws the dots and advances on a timer when autoplay is on.
 */
export default function CarouselFrame({ autoplay, dots, children }: { autoplay: boolean; dots: boolean; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const track = () => frame.current?.querySelector<HTMLElement>('[data-carousel-track]') ?? null;

  useEffect(() => {
    const el = track();
    if (!el) return;
    const slides = () => Array.from(el.children) as HTMLElement[];
    const onScroll = () => {
      const list = slides();
      const step = list[1] ? list[1].offsetLeft - list[0].offsetLeft : el.clientWidth;
      setActive(step > 0 ? Math.min(list.length - 1, Math.round(el.scrollLeft / step)) : 0);
    };
    setCount(slides().length);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [children]);

  useEffect(() => {
    if (!autoplay || paused || count < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      const el = track();
      if (!el) return;
      const next = (active + 1) % count;
      const slide = el.children[next] as HTMLElement | undefined;
      el.scrollTo({ left: slide?.offsetLeft ?? 0, behavior: 'smooth' });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the timer reads the live track through the ref
  }, [autoplay, paused, count, active]);

  const goTo = (index: number) => {
    const el = track();
    const slide = el?.children[index] as HTMLElement | undefined;
    el?.scrollTo({ left: slide?.offsetLeft ?? 0, behavior: 'smooth' });
  };

  return (
    <div
      ref={frame}
      className="v2-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {children}
      {dots && count > 1 && (
        <div className="v2-carousel__dots" role="group" aria-label="Slides">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              className="v2-carousel__dot"
              aria-label={`Slide ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
