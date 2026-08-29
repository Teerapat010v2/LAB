const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const AdminModel = require('./models/AdminModel');
const ComplaintModel = require('./models/ComplaintModel');
const MaintenanceModel = require('./models/MaintenanceModel');
const PlanModel = require('./models/PlanModel');
const HistoryModel = require('./models/HistoryModel');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://teerapatchiamram5_db_user:hmyzKxXPj9BqPLrI@cluster0.1qfiopq.mongodb.net/water_management?retryWrites=true&w=majority');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  console.log('Clearing old data...');
  await AdminModel.deleteMany({});
  await ComplaintModel.deleteMany({});
  await MaintenanceModel.deleteMany({});
  await PlanModel.deleteMany({});
  await HistoryModel.deleteMany({});

  console.log('Inserting 2 Staffs...');
  await AdminModel.insertMany([
    { name: 'สมปอง แอดมิน', phone: '081-111-1111', role: 'admin', note: 'แอดมินดูแลระบบทั้งหมด' },
    { name: 'สมชาย ผู้ดูแล', phone: '082-222-2222', role: 'maintenance', note: 'ผู้ดูแลระบบประปาและล้างถัง' },
  ]);

  console.log('Inserting 20 Complaints...');
  const complaints = [];
  const statuses = ['รอดำเนินการ', 'รับงาน', 'กำลังดำเนินการ', 'เสร็จงาน'];
  for (let i = 1; i <= 20; i++) {
    complaints.push({
      name: `ชาวบ้าน ${i}`,
      phone: `080-000-00${i.toString().padStart(2, '0')}`,
      topic: i % 3 === 0 ? 'น้ำขุ่นมาก' : i % 2 === 0 ? 'ท่อประปาแตก' : 'น้ำไม่ไหล',
      message: `พบปัญหาน้ำไม่ไหลหรือน้ำขุ่นที่หมู่ ${i % 5 + 1} รบกวนช่วยตรวจสอบด้วยครับ`,
      status: statuses[i % 4],
      submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    });
  }
  await ComplaintModel.insertMany(complaints);

  console.log('Inserting 20 Maintenance Logs...');
  const logs = [];
  for (let i = 1; i <= 20; i++) {
    const d = new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000);
    logs.push({
      date: d.toISOString().split('T')[0],
      reason: `ทำความสะอาดถังรอบที่ ${i}`,
      note: `ล้างถังตะกอนและใส่คลอรีนเพิ่ม ตรวจพบความขุ่นปกติ`,
    });
  }
  await MaintenanceModel.insertMany(logs);

  console.log('Inserting 20 Plans...');
  const plans = [];
  for (let i = 1; i <= 20; i++) {
    const d = new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000);
    plans.push({
      scheduleDate: d.toISOString().split('T')[0],
      description: `ตรวจเช็คปั๊มน้ำและระบบไฟ โซน ${i % 3 + 1}`,
      assignedTo: 'สมชาย ผู้ดูแล',
      status: i < 5 ? 'Completed' : 'Pending'
    });
  }
  await PlanModel.insertMany(plans);

  console.log('Inserting 20 History Records...');
  const histories = [];
  for (let i = 1; i <= 20; i++) {
    const d = new Date(Date.now() - i * 14 * 24 * 60 * 60 * 1000);
    histories.push({
      date: d.toISOString().split('T')[0],
      note: `บันทึกประวัติการเปลี่ยนสารกรองและซ่อมบำรุง ครั้งที่ ${i}`,
    });
  }
  await HistoryModel.insertMany(histories);

  console.log('Seeding complete!');
  process.exit(0);
};

seedData();
