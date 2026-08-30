const mongoose = require('mongoose');
const uri = 'mongodb+srv://teerapatchiamram5_db_user:hmyzKxXPj9BqPLrI@cluster0.1qfiopq.mongodb.net/water_management?retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('plans').updateMany({status: 'กำลังล้าง'}, {$set: {status: 'กำลังดำเนินการ'}});
  await db.collection('plans').updateMany({status: 'ล้างแล้ว'}, {$set: {status: 'เสร็จสิ้น'}});
  console.log('Fixed DB');
  process.exit(0);
});
