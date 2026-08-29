const router = require('express').Router();

// In-memory store for device config (can be moved to DB later)
let deviceConfig = { ssid: '', deviceIp: '' };
let pendingCommands = []; // queue of commands for ESP32 to pick up

// GET current config (ESP32 polls this)
router.get('/config', (req, res) => {
  res.json(deviceConfig);
});

// POST WiFi config from admin
router.post('/wifi', (req, res) => {
  const { ssid, password, deviceIp } = req.body;
  if (!ssid) return res.status(400).json({ message: 'ต้องระบุ SSID' });
  deviceConfig = { ssid, password, deviceIp: deviceIp || '' };
  pendingCommands.push({ cmd: 'SET_WIFI', ssid, password, timestamp: new Date() });
  res.json({ message: 'บันทึกการตั้งค่า WiFi แล้ว', config: { ssid, deviceIp } });
});

// POST reset WiFi
router.post('/reset', (req, res) => {
  deviceConfig = { ssid: '', deviceIp: '' };
  pendingCommands.push({ cmd: 'RESET_WIFI', timestamp: new Date() });
  res.json({ message: 'ส่งคำสั่งรีเซ็ต WiFi แล้ว' });
});

// POST restart device
router.post('/restart', (req, res) => {
  pendingCommands.push({ cmd: 'RESTART', timestamp: new Date() });
  res.json({ message: 'ส่งคำสั่งรีสตาร์ทแล้ว' });
});

// GET pending commands (ESP32 polls this to get commands)
router.get('/commands', (req, res) => {
  const cmds = [...pendingCommands];
  pendingCommands = []; // clear after sending
  res.json({ commands: cmds });
});

module.exports = router;
