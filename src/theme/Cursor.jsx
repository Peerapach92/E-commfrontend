import { useEffect } from 'react';

/**
 * เคอร์เซอร์เรืองแสงแบบ HUD — อิงจาก View.startCursor()
 * ต่างจากต้นฉบับตรงที่วาดด้วย CSS ล้วน ไม่ต้องใช้ไฟล์ sprite .png
 * (เปิดเฉพาะเมาส์จริง ไม่ทำงานบนมือถือ)
 */
export default function Cursor() {
  useEffect(() => {
    if (!matchMedia('(pointer:fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cur = document.createElement('div');
    cur.id = 'cursor';
    cur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cur);
    document.body.classList.add('cursor-on');

    let x = -100, y = -100, visible = false, raf;

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) { cur.style.display = 'block'; visible = true; }
      const t = e.target;
      const hot = t.closest && t.closest('a,button,input,label,.product');
      cur.classList.toggle('link', !!hot);
    };
    const onLeave = () => { cur.style.display = 'none'; visible = false; };

    addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    const tick = () => {
      cur.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
      document.body.classList.remove('cursor-on');
      cur.remove();
    };
  }, []);

  return null;
}
