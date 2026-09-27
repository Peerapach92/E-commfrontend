import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTheme } from './theme.js';

/**
 * ชั้นพื้นหลังทั้งหมด — พอร์ตจาก #bg ใน index.html + View.startParallax()
 *
 * รูปพื้นหลังต่อหน้าจอ **แยกตามธีม**: วางไฟล์ที่
 *   public/assets/menus/blue/<screen>.<นามสกุล>  (ธีมน้ำเงิน P3)
 *   public/assets/menus/red/<screen>.<นามสกุล>   (ธีมแดง-ดำ P5)
 * เช่น public/assets/menus/red/login.jpg
 *
 * ถ้าไม่เจอ .jpg โค้ดจะลองหา .jpeg → .png → .webp ให้อัตโนมัติ (กันพลาดเรื่องนามสกุล)
 * ถ้าไม่เจอไฟล์เลยสักนามสกุล รูปจะถอดตัวเองออก แล้วโชว์ไล่สีของ CSS แทน (ไม่พัง)
 *
 * ⚠️ ชื่อไฟล์ต้องตรงเป๊ะ: "login.jpg" ไม่ใช่ "login..jpg" (จุดสองจุด) หรือ "login .jpg"
 *    (Windows ซ่อนนามสกุลไฟล์ที่รู้จักอยู่แล้ว ไม่ต้องพิมพ์ ".jpg" เองตอนเปลี่ยนชื่อไฟล์)
 */
const SCREENS = ['login', 'shop', 'checkout', 'confirmation'];
const EXTS = ['jpg', 'jpeg', 'png', 'webp'];

const MenuArt = forwardRef(function MenuArt({ theme, name, active }, ref) {
  const [extIndex, setExtIndex] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  // ธีมเปลี่ยน = ต้องลองนามสกุลใหม่ตั้งแต่ .jpg อีกรอบ (ไฟล์ธีมใหม่อาจเป็นคนละนามสกุล)
  useEffect(() => {
    setExtIndex(0);
    setGaveUp(false);
  }, [theme, name]);

  if (gaveUp) return null;

  return (
    <img
      className={`menu-art ${active ? 'on' : ''}`}
      ref={ref}
      src={`/assets/menus/${theme}/${name}.${EXTS[extIndex]}`}
      alt=""
      onError={() => {
        if (extIndex < EXTS.length - 1) setExtIndex(extIndex + 1);
        else setGaveUp(true);
      }}
    />
  );
});

export default function Backdrop({ screen }) {
  const theme = useTheme();
  const stripesRef = useRef(null);
  const gridRef = useRef(null);
  const artRefs = useRef([]);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf;

    const onMove = (e) => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
    };
    addEventListener('mousemove', onMove, { passive: true });

    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      if (stripesRef.current)
        stripesRef.current.style.transform = `translate(${cx * 22}px, ${cy * 14}px)`;
      if (gridRef.current)
        gridRef.current.style.transform = `translate(${cx * -34}px, ${cy * -22}px)`;
      artRefs.current.forEach((a) => {
        if (a) a.style.transform = `translate(${cx * 14}px, ${cy * 9}px) scale(1.05)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div id="bg" aria-hidden="true">
      <div className="bg-layer" id="bg-gradient" />
      <div className="bg-layer" id="bg-stripes" ref={stripesRef} />

      {SCREENS.map((name, i) => (
        <MenuArt
          key={`${theme}-${name}`}
          theme={theme}
          name={name}
          active={screen === name}
          ref={(el) => (artRefs.current[i] = el)}
        />
      ))}

      <div className="bg-layer" id="bg-grid" ref={gridRef} />
      <div className="bg-layer" id="bg-moon" />
      <div className="bg-layer" id="bg-vignette" />
      <div className="bg-layer" id="bg-slash" />
    </div>
  );
}
