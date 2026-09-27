/* =====================================================================
   เพลงพื้นหลัง (BGM) — เล่นต่อเนื่องตั้งแต่เข้าเว็บจนปิดแท็บ

   พฤติกรรม:
   - เริ่มเล่นตั้งแต่ครั้งแรกที่ผู้ใช้คลิก/กดคีย์บอร์ดที่ไหนก็ได้ในเว็บ
     (เบราว์เซอร์บล็อก autoplay จนกว่าจะมี user gesture — ทำอะไรไม่ได้ก่อนหน้านั้น)
   - เล่นวนลูปไม่รู้จบ (audio.loop = true)
   - เปลี่ยนหน้า (React state) ไม่ได้สร้าง <audio> ใหม่ เพราะ instance เดียวนี้
     อยู่ระดับโมดูล ไม่ได้อยู่ใน component ใด ๆ จึง "เล่นต่อ" ข้ามหน้าได้เอง
   - กดปุ่มต่าง ๆ ในเว็บ (เพิ่มของ/ชำระเงิน/ล็อกอิน ฯลฯ) เรียก playSelect() เหมือนเดิม
     แต่ตอนนี้แค่ "เช็คว่าเพลงเล่นอยู่รึยัง ถ้ายังไม่เล่นก็เริ่ม" ไม่รีเซ็ตเพลงที่เล่นอยู่แล้ว
   - สลับธีม (setBgmTheme) จะเปลี่ยนไฟล์เพลงไปอีกเพลงหนึ่ง — ตรงนี้ตั้งใจ "รีสตาร์ท"
     เพราะเป็นคนละเพลงกัน ต่างจากตอนกดปุ่มทั่วไปที่ห้ามรีสตาร์ทเพลงเดิม

   ไฟล์เพลง:
     public/assets/sfx/bgm-blue.mp3  (ธีมน้ำเงิน P3)
     public/assets/sfx/bgm-red.mp3   (ธีมแดง-ดำ P5)
   ===================================================================== */
import { useEffect, useState } from 'react';

const BGM_URLS = {
  blue: '/assets/sfx/bgm-blue.mp3',
  red: '/assets/sfx/bgm-red.mp3',
};
const VOLUME_KEY = 'persona.volume';
const STEP = 20;        // ขั้นละ 20% ต่อการกด −/+
const MAX_GAIN = 0.45;  // ความดังสูงสุดจริง (ที่ volume = 100%)

let audio = null;
let unlocked = false;
let currentBgmTheme = 'blue';
let volume = 60;        // 0–100, ค่าเริ่มต้น
let lastNonZero = 60;   // จำไว้ตอนกดปิดเสียงแล้วกดเปิดใหม่
const listeners = new Set();

try {
  const saved = localStorage.getItem(VOLUME_KEY);
  if (saved !== null) {
    volume = Math.max(0, Math.min(100, Number(saved)));
    if (volume > 0) lastNonZero = volume;
  }
} catch { /* โหมดส่วนตัวบางเบราว์เซอร์อ่านไม่ได้ */ }

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio(BGM_URLS[currentBgmTheme]);
  audio.preload = 'auto';
  audio.loop = true;                          // วนซ้ำไม่รู้จบ
  audio.volume = (volume / 100) * MAX_GAIN;
  return audio;
}

/** เริ่มเล่นถ้ายังไม่เล่นอยู่ — ไม่แตะเพลงที่กำลังเล่นอยู่แล้ว (กันรีสตาร์ท) */
function tryStart() {
  if (volume === 0) return;
  const a = ensureAudio();
  if (!a.paused) return; // เล่นอยู่แล้ว ไม่ต้องทำอะไร
  const p = a.play();
  if (p && p.catch) p.catch(() => {}); // ยังไม่มี user gesture ก็ไม่พัง แค่ยังไม่เล่น
}

/**
 * เปลี่ยนเพลงตามธีม (เรียกจาก useThemeAudioSync ตอน setTheme)
 * คนละเพลงกัน จึงตั้งใจรีสตาร์ทเพลงใหม่จากต้น ต่างจาก playSelect() ที่ห้ามรีสตาร์ท
 */
export function setBgmTheme(theme) {
  if (theme !== 'blue' && theme !== 'red') return;
  if (theme === currentBgmTheme) return;
  const wasPlaying = !!audio && !audio.paused;
  currentBgmTheme = theme;

  if (!audio) return; // ยังไม่เคยสร้าง <audio> เลย (ยังไม่มี gesture) — แค่จำธีมไว้พอ

  audio.pause();
  audio.src = BGM_URLS[theme];
  audio.currentTime = 0;
  audio.load();
  if (wasPlaying && volume > 0) {
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
  }
}

// ปลดล็อก + เริ่มเพลงตั้งแต่ gesture แรกของผู้ใช้ ที่ไหนก็ได้ในหน้าเว็บ (ครอบคลุมหน้า login ด้วย)
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    tryStart();
  };
  ['pointerdown', 'keydown'].forEach((e) =>
    addEventListener(e, unlock, { once: true, passive: true })
  );
}

/**
 * เรียกจากปุ่มต่าง ๆ ทั่วเว็บ — แค่ "ทำให้แน่ใจว่าเพลงกำลังเล่นอยู่"
 * ถ้าเพลงเล่นอยู่แล้วจะไม่ทำอะไรเลย (ไม่รีสตาร์ท ไม่กระตุก)
 */
export function playSelect() {
  tryStart();
}

function persist() {
  try { localStorage.setItem(VOLUME_KEY, String(volume)); } catch { /* ignore */ }
}

/** ตั้งระดับเสียงตรง ๆ (0–100) */
export function setVolume(next) {
  volume = Math.max(0, Math.min(100, Math.round(next)));
  if (volume > 0) lastNonZero = volume;

  if (audio) audio.volume = (volume / 100) * MAX_GAIN;

  if (volume === 0) {
    audio?.pause();                 // หยุดเล่นจริง ๆ เมื่อปิดเสียงสนิท (ประหยัด ไม่ใช่แค่เงียบ)
  } else {
    tryStart();                     // ปรับจาก 0% ขึ้นมา ให้เพลงเล่นต่อจากตำแหน่งเดิมทันที
  }

  persist();
  listeners.forEach((fn) => fn(volume));
}

/** กดปุ่ม − หรือ + ทีละขั้น */
export function stepVolume(direction) {
  setVolume(volume + direction * STEP);
}

/** ไอคอนลำโพง: ปิดเสียง / กลับไปที่ระดับก่อนปิด (เพลงเล่นต่อจากตำแหน่งเดิม ไม่ใช่เริ่มใหม่) */
export function toggleMute() {
  setVolume(volume > 0 ? 0 : (lastNonZero || 60));
}

export function getVolume() {
  return volume;
}

/** hook สำหรับปุ่มปรับเสียงบน HUD */
export function useVolume() {
  const [value, setValue] = useState(volume);
  useEffect(() => {
    listeners.add(setValue);
    return () => listeners.delete(setValue);
  }, []);
  return value;
}
