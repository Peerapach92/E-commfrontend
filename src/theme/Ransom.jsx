import { hash } from './hash.js';

/**
 * ตัวอักษรแบบ "ตัดแปะ" (ransom note) — พอร์ตจาก View.ransomize() ใน view.js
 * ใช้แทนหัวข้อ: <Ransom text="Desk gear" />
 */
export default function Ransom({ text, className = '' }) {
  return (
    <span className={`ransom ${className}`}>
      {[...text].map((c, i) => {
        const h = hash(text + i);
        const rot = (h % 17) - 8;                  // -8..8 องศา
        const scale = 0.86 + ((h >> 3) % 30) / 100; // 0.86..1.15
        const dy = ((h >> 5) % 9) - 4;              // -4..4 px
        const t = `rotate(${rot}deg) scale(${scale}) translateY(${dy}px)`;
        const variant = (h >> 7) % 10;
        const kind = variant === 0 ? 'box' : variant === 1 ? 'boxw' : variant === 2 ? 'hi' : '';
        return (
          <span
            key={i}
            className={`ch ${kind}`}
            style={{ '--t': t, transform: t }}
            aria-hidden="true"
          >
            {c === ' ' ? '\u00A0' : c}
          </span>
        );
      })}
      <span className="sr-only">{text}</span>
    </span>
  );
}
