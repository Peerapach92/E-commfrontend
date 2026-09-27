/* =====================================================================
   สถานะธีม (สีน้ำเงิน P3 / สีแดง-ดำ P5) — module-level singleton
   เหมือนรูปแบบเดียวกับ sfx.js (มี listeners set + hook สำหรับ React)

   วิธีทำงาน:
   - ตั้ง attribute data-theme="red" หรือลบออก (=blue) บน <html> โดยตรง
   - styles.css มี `:root[data-theme='red'] { ... }` override ตัวแปรสีทุกตัว
     ไว้แล้ว ดังนั้นแค่เปลี่ยน attribute ตัวเดียว สีทั้งเว็บก็เปลี่ยนตาม
     ไม่ต้องมี logic สลับ class ทีละที่
   - เก็บค่าไว้ใน localStorage เข้าเว็บรอบหน้าธีมเดิมยังอยู่
   - import โมดูลนี้ (แม้ไม่ได้เรียกฟังก์ชันอะไร) จะ apply ธีมทันทีตั้งแต่
     โหลดสคริปต์ ก่อน React render ด้วยซ้ำ กันไม่ให้จอกะพริบเห็นธีมผิดแวบแรก
   ===================================================================== */
import { useEffect, useState } from 'react';

const THEME_KEY = 'persona.theme';
const THEME_COLOR = { blue: '#0a1533', red: '#0b0b0d' };

let theme = 'blue';
try {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'red' || saved === 'blue') theme = saved;
} catch { /* โหมดส่วนตัวบางเบราว์เซอร์อ่านไม่ได้ */ }

const listeners = new Set();

function apply(t) {
  if (typeof document === 'undefined') return;
  if (t === 'red') document.documentElement.setAttribute('data-theme', 'red');
  else document.documentElement.removeAttribute('data-theme');

  // อัปเดตสีแถบด้านบนเบราว์เซอร์มือถือให้ตรงธีมด้วย (ไม่มีก็ไม่พัง)
  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.setAttribute('content', THEME_COLOR[t] || THEME_COLOR.blue);
}

apply(theme); // ใช้ทันทีตอน import โมดูล กันจอกะพริบ

export function getTheme() {
  return theme;
}

export function setTheme(next) {
  if (next !== 'blue' && next !== 'red') return;
  if (next === theme) return;
  theme = next;
  apply(theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  listeners.forEach((fn) => fn(theme));
}

export function toggleTheme() {
  setTheme(theme === 'blue' ? 'red' : 'blue');
}

/** hook สำหรับ component ที่ต้องรู้ธีมปัจจุบัน (ปุ่มสลับธีม, พื้นหลัง, เพลง) */
export function useTheme() {
  const [value, setValue] = useState(theme);
  useEffect(() => {
    listeners.add(setValue);
    return () => listeners.delete(setValue);
  }, []);
  return value;
}
