const fs = require('fs');
const files = ['frontend/components/Layout.js', 'frontend/pages/index.js', 'frontend/pages/swagger.js', 'frontend/public/manifest.json', 'frontend/pages/login.js'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/ระบบจัดการน้ำประปาหมู่บ้าน/g, 'ระบบดูแลน้ำประปาหมู่บ้าน');
    c = c.replace(/<span>ระบบน้ำประปาหมู่บ้าน<\/span>/g, '<span>ระบบดูแลน้ำประปาหมู่บ้าน</span>');
    c = c.replace(/คู่มือ API ระบบน้ำประปาหมู่บ้าน/g, 'คู่มือ API ระบบดูแลน้ำประปาหมู่บ้าน');
    fs.writeFileSync(f, c, 'utf8');
  }
});
