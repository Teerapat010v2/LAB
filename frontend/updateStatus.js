const mongoose = require('mongoose');
const uri = 'mongodb+srv://teerapatchiamram5_db_user:hmyzKxXPj9BqPLrI@cluster0.1qfiopq.mongodb.net/water_management?retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
  console.log('Connected');
  const db = mongoose.connection.db;
  const b = await db.collection('bugs').updateMany({status: 'Open'}, {$set: {status: 'รอดำเนินการ'}});
  console.log('bugs:', b.modifiedCount);
  const p = await db.collection('plans').updateMany({status: 'Planned'}, {$set: {status: 'ตามแผน'}});
  console.log('plans:', p.modifiedCount);
  const c = await db.collection('complaints').updateMany({status: 'Open'}, {$set: {status: 'รอดำเนินการ'}});
  console.log('complaints:', c.modifiedCount);
  process.exit(0);
});
