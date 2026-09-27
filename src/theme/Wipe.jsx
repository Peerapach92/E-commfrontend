import { forwardRef } from 'react';

/**
 * ม่านตัดฉากทแยงแบบในคลิปอ้างอิง
 *
 * แผ่นขอบเฉียง 3 แผ่นซ้อนกัน กวาดเข้ามาจากทางขวาทีละชั้น:
 *   pane-1 = ขาว  →  pane-2 = ดำ  →  pane-3 = สีของ "หน้าปลายทาง"
 * ตอนที่แผ่นสุดท้ายบังจอเต็ม จะสลับหน้า + มีแฟลชขาวอ่อน ๆ
 * แล้วทั้งสามแผ่นถอยออกทางขวาเป็นลิ่มซ้อนกัน เผยหน้าใหม่จากทางซ้าย
 *
 * สีของ pane-3 มาจากตัวแปร --wipe-accent ที่ useWipe() ตั้งให้ตอนเรียกใช้
 */
const Wipe = forwardRef(function Wipe(_props, ref) {
  return (
    <div id="wipe" ref={ref} aria-hidden="true">
      <div className="pane pane-1" />
      <div className="pane pane-2" />
      <div className="pane pane-3" />
      <div className="wipe-flash" />
    </div>
  );
});

export default Wipe;
