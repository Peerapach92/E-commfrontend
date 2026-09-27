import { useCallback, useRef } from 'react';

/* จังหวะของแอนิเมชัน — ต้องตรงกับ #wipe ใน styles.css */
const SWAP_AT = 370;   // แผ่นที่ 3 บังจอเต็มพอดี → สลับหน้าตรงนี้ (พร้อมแฟลช)
const DONE_AT = 820;   // แผ่นสุดท้ายกวาดพ้นขอบขวา

/* สีของแผ่นที่ 3 = สีประจำหน้าปลายทาง */
const ACCENT = {
  shop: '#6fe3ff',
  checkout: '#2b6ef5',
  confirmation: '#eef4fd',
  login: '#0a1533',
  register: '#16306f',
  admin: '#4f8cff',
};

/**
 * สั่งตัดฉาก แล้วสลับหน้าตอนจอถูกบังพอดี
 *
 *   const { wipeRef, runWipe } = useWipe();
 *   runWipe(() => setView('checkout'), 'checkout');
 *
 * ผู้ใช้ที่เปิด prefers-reduced-motion ไว้ยังเห็นการเปลี่ยนหน้า แค่เป็นเวอร์ชัน
 * เบากว่า (ไล่โปร่งแสงสั้น ๆ แทนม่านกวาดเอียง) — ดู @media ใน styles.css
 * ตั้งใจไม่ตัดออกไปเฉย ๆ เพราะถ้าสลับหน้าแบบไม่มีสัญญาณอะไรเลย ผู้ใช้จะไม่รู้ว่า
 * "หน้าเปลี่ยนแล้ว" กับ "เว็บค้าง" ต่างกันยังไง
 */
export function useWipe() {
  const wipeRef = useRef(null);
  const busy = useRef(false);

  const runWipe = useCallback((swap, to) => {
    const el = wipeRef.current;
    if (!el || busy.current) {
      if (import.meta.env.DEV) {
        console.warn(
          !el
            ? '[wipe] #wipe ref ยังไม่พร้อม — สลับหน้าแบบไม่มีม่าน (ไม่ควรเกิดขึ้นหลัง mount แล้ว)'
            : '[wipe] มีม่านอีกชุดกำลังเล่นอยู่ — สลับหน้าทันทีแทนการรอคิว'
        );
      }
      swap();
      return;
    }
    busy.current = true;
    el.style.setProperty('--wipe-accent', ACCENT[to] || ACCENT.shop);
    el.classList.remove('go');
    void el.offsetWidth; // บังคับให้ animation เริ่มใหม่
    el.classList.add('go');

    setTimeout(swap, SWAP_AT);
    setTimeout(() => {
      el.classList.remove('go');
      busy.current = false;
    }, DONE_AT);
  }, []);

  return { wipeRef, runWipe };
}
