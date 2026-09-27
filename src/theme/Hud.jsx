import { useEffect, useState } from 'react';
import { playSelect, setVolume, stepVolume, toggleMute, useVolume } from './sfx.js';
import { useTheme, toggleTheme } from './theme.js';
import { useTransition } from './transition.js';

/**
 * ปุ่มสลับธีม น้ำเงิน (P3) ↔ แดง-ดำ (P5)
 * transition() ตอนนี้เป็นแค่ swap ทันที (ดู theme/transition.js) — เรียกไว้เผื่อ
 * อนาคตอยากใส่เอฟเฟกต์อะไรกลับมาอีกครั้ง โดยไม่ต้องแก้ที่เรียกใช้จุดนี้
 */
function ThemeToggle() {
  const theme = useTheme();
  const transition = useTransition();
  const next = theme === 'blue' ? 'red' : 'blue';

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle-${theme} sfx`}
      onClick={() => {
        playSelect();
        transition(() => toggleTheme());
      }}
      aria-label={`สลับไปธีม${next === 'red' ? 'สีแดง-ดำ' : 'สีน้ำเงิน'}`}
      title={next === 'red' ? 'Switch to red/black theme' : 'Switch to blue theme'}
    >
      <span className="theme-toggle-dot" aria-hidden="true" />
      <span className="theme-toggle-label">{next === 'red' ? 'RED THEME' : 'BLUE THEME'}</span>
    </button>
  );
}

/** แถบ HUD บน-ล่างแบบหน้าจอเกม — พอร์ตจาก #hud-top / #hud-bottom + View.startClock() */
export function HudTop({ left, right }) {
  return (
    <div id="hud-top">
      <div className="hud-tag" aria-hidden="true">{left}</div>
      <div className="hud-top-right">
        <ThemeToggle />
        <div className="hud-tag alt" aria-hidden="true">{right}</div>
      </div>
    </div>
  );
}

/**
 * ระบบเพิ่มลดเสียงเพลงเมนู
 * - คลิกไอคอนลำโพง = mute/unmute (จำระดับก่อนปิดไว้ ปุ่มเดิมกดแล้วกลับมาที่เดิม)
 * - ปุ่ม − / + = ปรับทีละ 20%
 * - แถบเลื่อนลาก = ปรับละเอียด
 * ค่าที่ตั้งไว้ถูกบันทึกใน localStorage เก็บข้ามการเข้าเว็บครั้งต่อไป
 */
function VolumeControl() {
  const volume = useVolume();

  const icon = volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊';

  return (
    <div className="volume-control" role="group" aria-label="ระดับเสียงเมนู">
      <button
        type="button"
        className="hud-mute"
        onClick={() => toggleMute()}
        aria-pressed={volume === 0}
        aria-label={volume === 0 ? 'เปิดเสียงเมนู' : 'ปิดเสียงเมนู'}
        title={volume === 0 ? 'Sound off' : 'Sound on'}
      >
        {icon}
      </button>

      <button
        type="button"
        className="volume-step"
        onClick={() => stepVolume(-1)}
        disabled={volume <= 0}
        aria-label="ลดเสียงลง 20%"
        title="Volume down"
      >
        −
      </button>

      <input
        className="volume-slider"
        type="range"
        min="0"
        max="100"
        step="5"
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="ระดับเสียงเมนู"
        aria-valuetext={`${volume}%`}
      />

      <button
        type="button"
        className="volume-step"
        onClick={() => stepVolume(1)}
        disabled={volume >= 100}
        aria-label="เพิ่มเสียงขึ้น 20%"
        title="Volume up"
      >
        +
      </button>

      <span className="volume-value" aria-hidden="true">
        {volume}%
      </span>
    </div>
  );
}

export function HudBottom({ hints }) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div id="hud-bottom">
      {hints.map(([k, label]) => (
        <span key={k}>
          <span className="hud-key">{k}</span>
          {label}
        </span>
      ))}
      <VolumeControl />
      <span id="clock">{clock}</span>
    </div>
  );
}
