import { useEffect } from 'react';
import { useTheme } from './theme.js';
import { setBgmTheme } from './sfx.js';

/**
 * จุดเชื่อมเดียวระหว่างธีมกับเพลง — ทุกครั้งที่ธีมเปลี่ยน (ผ่านปุ่ม ThemeToggle
 * หรือโหลดค่าที่จำไว้จาก localStorage ตอนเข้าเว็บ) จะสั่ง sfx.js ให้สลับไฟล์เพลง
 * ให้ตรงธีมโดยอัตโนมัติ เรียกครั้งเดียวที่ระดับบนสุดของแอป (App.jsx)
 */
export function useThemeAudioSync() {
  const theme = useTheme();
  useEffect(() => {
    setBgmTheme(theme);
  }, [theme]);
}
