const fs = require('fs');
const files = [
  'components/Layout.js', 'pages/admin.js', 'pages/complaints.js',
  'pages/contact.js', 'pages/device.js', 'pages/history.js',
  'pages/maintenance-logs.js', 'pages/maintenance.js', 'pages/plans.js',
  'pages/user.js', 'pages/water.js'
];
files.forEach(f => {
  const p = 'frontend/' + f;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/\|\| 'http:\/\/localhost:5000'/g, "|| ''");
  fs.writeFileSync(p, c);
});
