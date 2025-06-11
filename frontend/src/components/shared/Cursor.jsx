import { useEffect, useRef } from 'react';

function Cursor() {
  const cursorRef = useRef(null);
  const cursorBlurRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorBlur = cursorBlurRef.current;

    const moveCursor = (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      cursorBlur.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
    };

    const handleHover = () => {
      cursor.classList.add('scale-[3]', 'border-white', 'bg-transparent');
      cursor.classList.remove('scale-100', 'border-0', 'bg-brand-blue');
    };

    const handleUnhover = () => {
      cursor.classList.remove('scale-[3]', 'border-white', 'bg-transparent');
      cursor.classList.add('scale-100', 'border-0', 'bg-brand-blue');
    };

    document.addEventListener('mousemove', moveCursor);

    const hoverElements = document.querySelectorAll('a, button, .hover-effect');
    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', handleHover);
      element.addEventListener('mouseleave', handleUnhover);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      hoverElements.forEach(element => {
        element.removeEventListener('mouseenter', handleHover);
        element.removeEventListener('mouseleave', handleUnhover);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-5 h-5 rounded-full pointer-events-none z-50 transition-none duration-100 ease-out -translate-x-1/2 -translate-y-1/2 bg-blue-500"
      />
      <div
        ref={cursorBlurRef}
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-10 bg-blue-500/30 blur-[180px] transition-none duration-300"
      />
    </>
  );
}

export default Cursor;
