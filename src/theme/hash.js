// Deterministic pseudo-random hash — ยกมาจาก view.js ของ portfolio
// ทำให้ตัวอักษรเอียง/ขนาดเท่าเดิมทุกครั้งที่เข้าเว็บ ไม่กระพริบเปลี่ยนไปมา
export function hash(str) {
  let h = 9;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 387420489);
  return (h ^ (h >>> 9)) >>> 0;
}
