import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './theme/theme.js'; // ตั้งค่า data-theme บน <html> ทันที กันจอกะพริบธีมผิดตอนโหลด
import './theme/hoverSfx.js'; // เสียง hover ทั่วเว็บ — ทำงานเองผ่าน event delegation ไม่ต้องเรียกใช้ตรง ๆ
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
