/* =====================================================================
   เสียง hover — เล่นเฉพาะปุ่ม "สำคัญ" ที่ติด class .sfx เท่านั้น
   ไฟล์เสียง: public/assets/sfx/hover.mp3  (เปลี่ยนไฟล์นี้ = เปลี่ยนเสียง)

   ทำงานแบบ "global event delegation": ฟังอีเวนต์ที่ document ตัวเดียว
   แต่กรองเฉพาะ element ที่มี class="sfx" (ไปติดเองที่ปุ่มสำคัญ เช่น
   Add to cart / Place order / Sign in / Checkout / Add to shop / ThemeToggle)
   ปุ่มรอง ๆ (Sign out, Remove, ลูกศร +/-, ลิงก์ย้อนกลับ, ปุ่มปรับเสียง ฯลฯ)
   ไม่ติด class นี้ จึงเงียบ — รวมถึงปุ่มปรับระดับเสียงเพลงเอง (กันเสียง
   hover.mp3 มากวนตอนกำลังปรับเสียงเพลงอยู่)

   - เล่นเฉพาะเมาส์จริง (pointer: fine) ไม่เล่นตอนแตะจอมือถือ เพราะมือถือไม่มี "hover"
     จริง ๆ (แตะจอ = คลิกเลย เล่นเสียงซ้ำซ้อนกับตอนกดจะดูแปลก)
   - เสียงเบาลง/เงียบสนิทตามระดับเสียงเดียวกับเพลงพื้นหลัง (ปรับที่ HUD มุมขวาล่าง)
     ปิดเสียงเป็น 0% แล้ว hover จะไม่มีเสียงด้วย เพราะถือเป็นเสียงเว็บตัวเดียวกัน
   - เข้า element เดิมซ้ำ (ขยับเมาส์ในปุ่มเดียวกัน) จะไม่เล่นซ้ำ ต้องออกแล้วเข้าใหม่
     หรือย้ายไป element ที่กดได้ตัวอื่นก่อน ถึงจะเล่นอีกครั้ง
   ===================================================================== */
import { getVolume } from './sfx.js';

const HOVER_URL = '/assets/sfx/hover.mp3';
const MAX_GAIN = 0.35; // เบากว่าเพลงพื้นหลังเล็กน้อย กันไม่ให้กลบเพลง

// เฉพาะ element ที่ติด class="sfx" เท่านั้นที่ถือว่า "hover ได้ยินเสียง"
// เพิ่มปุ่มสำคัญใหม่ในอนาคต = ใส่ class="sfx" ที่ตัวปุ่มนั้น ไม่ต้องแก้ไฟล์นี้
const SELECTOR = '.sfx';

let audio = null;
let lastEl = null;

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio(HOVER_URL);
  audio.preload = 'auto';
  return audio;
}

function play() {
  const volume = getVolume();
  if (volume === 0) return; // ปิดเสียงไว้ ก็ไม่ต้องเล่น
  try {
    const a = ensureAudio();
    a.volume = (volume / 100) * MAX_GAIN;
    a.currentTime = 0; // hover สั้น ๆ รีสตาร์ทได้ทุกครั้ง ต่างจาก BGM ที่ห้ามรีสตาร์ท
    const p = a.play();
    if (p && p.catch) p.catch(() => {}); // ยังไม่มี user gesture ก็ไม่พัง
  } catch { /* ไม่มีไฟล์เสียงก็ไม่พัง */ }
}

function onPointerOver(e) {
  const el = e.target.closest(SELECTOR);
  if (!el || el === lastEl) return; // ยังอยู่ใน element เดิม ไม่เล่นซ้ำ
  lastEl = el;
  play();
}

function onPointerOut(e) {
  const el = e.target.closest(SELECTOR);
  if (!el || el !== lastEl) return;
  // ย้ายไป element ย่อยข้างในตัวเดิม ไม่นับว่าออก
  if (el.contains(e.relatedTarget)) return;
  lastEl = null;
}

// เปิดเฉพาะเครื่องที่มีเมาส์จริง กันเสียงซ้ำซ้อนตอนแตะจอมือถือ
if (typeof window !== 'undefined' && matchMedia('(pointer: fine)').matches) {
  document.addEventListener('pointerover', onPointerOver, { passive: true });
  document.addEventListener('pointerout', onPointerOut, { passive: true });
}
