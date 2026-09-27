/**
 * โครงเนื้อหา (skeleton) ตอนกำลังโหลดข้อมูลจริง
 *
 * แทนที่ข้อความ "Loading products…" เดิม เพราะบล็อกทึบ ๆ ที่มีรูปทรงและ
 * ขนาดใกล้เคียงของจริง ทำให้รู้สึกว่าหน้าโหลดเร็วกว่า (perceived performance)
 * และไม่มีจังหวะ "จอว่าง" ระหว่างเปลี่ยนหน้า
 *
 * ตัดมุมด้วย var(--cut) ชุดเดียวกับ .product การ์ดจริง เพื่อให้เป็นทรงเดียวกัน
 * ไม่ใช่แค่กล่องสี่เหลี่ยมเทา ๆ ทั่วไป — ยังคงบุคลิกของธีมไว้แม้ตอนยังไม่มีข้อมูล
 */
export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="product-skel" style={{ '--i': i }}>
          <div className="skel-img" />
          <div className="skel-body">
            <div className="skel-line skel-line-title" />
            <div className="skel-line skel-line-title-short" />
            <div className="skel-row">
              <div className="skel-line skel-line-price" />
              <div className="skel-line skel-line-btn" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** บล็อกเดี่ยว ๆ ใช้ปะติดปะต่อเป็น skeleton อื่น ๆ ได้ตามต้องการ (เช่นรูปสินค้าเดี่ยว) */
export function SkelBlock({ className = '', style }) {
  return <div className={`skel-block ${className}`} style={style} aria-hidden="true" />;
}
