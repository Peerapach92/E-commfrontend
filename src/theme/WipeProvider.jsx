import { createContext, useContext } from 'react';
import Wipe from './Wipe.jsx';
import { useWipe } from './useWipe.js';

/**
 * ม่านตัดฉากตัวเดียวของทั้งแอป
 *
 * เหตุผลที่ต้องใช้ context แทนการวาง <Wipe /> ไว้ใน App เฉย ๆ:
 * การเปลี่ยนหน้าไม่ได้เกิดที่ App ที่เดียว — เช่น สลับ register ↔ login
 * เกิดข้างใน Login.jsx เอง คอมโพเนนต์พวกนี้เลยต้องเรียกม่านได้ด้วยตัวเอง
 *
 * วิธีใช้ในคอมโพเนนต์ไหนก็ได้:
 *   const transition = useTransition();
 *   transition(() => setMode('login'), 'login');
 */
const WipeContext = createContext(null);

export function useTransition() {
  const run = useContext(WipeContext);
  // ถ้าลืมครอบ provider ก็ให้สลับหน้าแบบไม่มีม่าน ดีกว่าแอปพัง
  return run || ((swap) => swap());
}

export default function WipeProvider({ children }) {
  const { wipeRef, runWipe } = useWipe();

  return (
    <WipeContext.Provider value={runWipe}>
      {/* อยู่นอก children เสมอ React จึงไม่ถอด DOM ทิ้งกลางทางตอนสลับหน้า */}
      <Wipe ref={wipeRef} />
      {children}
    </WipeContext.Provider>
  );
}
