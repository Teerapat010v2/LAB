const mongoose = require('mongoose');
const uri = 'mongodb+srv://teerapatchiamram5_db_user:hmyzKxXPj9BqPLrI@cluster0.1qfiopq.mongodb.net/water_management?retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('plans').updateMany({status: 'Pending'}, {$set: {status: 'ตามแผน'}});
  await db.collection('plans').updateMany({status: 'Open'}, {$set: {status: 'ตามแผน'}});
  await db.collection('bugs').updateMany({status: 'Pending'}, {$set: {status: 'รอดำเนินการ'}});
  await db.collection('bugs').updateMany({status: 'Open'}, {$set: {status: 'รอดำเนินการ'}});
  await db.collection('complaints').updateMany({status: 'Pending'}, {$set: {status: 'รอดำเนินการ'}});
  await db.collection('complaints').updateMany({status: 'Open'}, {$set: {status: 'รอดำเนินการ'}});
  console.log('Fixed DB');
  process.exit(0);
});
