import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;

    if (!cursor || !trail) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX - 10}px`;
      cursor.style.top = `${e.clientY - 10}px`;
      
      setTimeout(() => {
        trail.style.left = `${e.clientX - 4}px`;
        trail.style.top = `${e.clientY - 4}px`;
      }, 50);
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" data-testid="custom-cursor" />
      <div ref={trailRef} className="cursor-trail" data-testid="cursor-trail" />
    </>
  );
}
