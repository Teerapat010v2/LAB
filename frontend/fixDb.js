const mongoose = require('mongoose');
const uri = 'mongodb+srv://teerapatchiamram5_db_user:hmyzKxXPj9BqPLrI@cluster0.1qfiopq.mongodb.net/water_management?retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('plans').updateMany({status: 'Completed'}, {$set: {status: 'ล้างแล้ว'}});
  await db.collection('plans').updateMany({status: 'Planned'}, {$set: {status: 'ตามแผน'}});
  await db.collection('bugs').updateMany({status: 'Resolved'}, {$set: {status: 'เสร็จงาน'}});
  await db.collection('bugs').updateMany({status: 'Closed'}, {$set: {status: 'เสร็จงาน'}});
  await db.collection('bugs').updateMany({status: 'In Progress'}, {$set: {status: 'กำลังดำเนินการ'}});
  await db.collection('complaints').updateMany({status: 'In Progress'}, {$set: {status: 'กำลังดำเนินการ'}});
  await db.collection('complaints').updateMany({status: 'Resolved'}, {$set: {status: 'เสร็จงาน'}});
  await db.collection('complaints').updateMany({status: 'Closed'}, {$set: {status: 'เสร็จงาน'}});
  console.log('Fixed DB');
  process.exit(0);
});
