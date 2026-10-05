import { useEffect, useRef, useState, type ReactNode } from "react";

const canAnimate = (): boolean => {
  if (typeof window === "undefined") return false;
  if (typeof IntersectionObserver === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // Chrome stops delivering IntersectionObserver callbacks while a document
  // isn't painting (background tab). Animating from a hidden start state
  // there would leave the content invisible until the tab is focused.
  if (document.visibilityState === "hidden") return false;
  return true;
};

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Fades and lifts its children into place once they scroll into view.
 *
 * All the actual styling is Tailwind classes — this only flips which set is
 * applied. It starts in the VISIBLE state whenever it can't animate, so a
 * visitor with reduced motion gets a normal page rather than a blank one.
 */
export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  // useRef gives a mutable box (`ref.current`) that survives re-renders
  // without causing a re-render when it changes — unlike useState. It's
  // attached to the <div> below via `ref={ref}`, which is how we get a
  // handle on the actual DOM node to observe it with IntersectionObserver.
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(() => !canAnimate());

  useEffect(() => {
    if (shown) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
