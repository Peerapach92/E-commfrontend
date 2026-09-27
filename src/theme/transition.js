/**
 * เดิมไฟล์นี้เคยครอบการสลับหน้าด้วยม่านตัดฉาก (ดู git history / WipeProvider เดิม)
 * ตอนนี้ตัดม่านออกตามคำขอ ("เอา transition ระหว่างหน้าออก ให้ดูไว") — สลับหน้าทันที
 * ไม่มีดีเลย์ ไม่มี overlay
 *
 * เก็บชื่อ/รูปแบบ useTransition() ไว้เหมือนเดิม เพื่อไม่ต้องแก้ App.jsx, Login.jsx,
 * Hud.jsx (ที่เรียก transition(swap, next) อยู่แล้ว) — ตอนนี้แค่เรียก swap() ตรง ๆ
 */
export function useTransition() {
  return (swap) => swap();
}
