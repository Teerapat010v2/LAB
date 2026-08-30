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

const names = [
  "สมศักดิ์ แซ่ตั้ง", "สมหมาย ใจดี", "บุญชู แสงทอง", "วันเพ็ญ สุขสวัสดิ์",
  "นงนุช รักษ์ไทย", "วิชัย มุ่งมาด", "อำนาจ เจริญชัย", "สุนทร ยิ่งยง",
  "ประเสริฐ ดีเด่น", "มณีรัตน์ งามตา", "ชาติชาย สิงห์ทอง", "กฤษดา ศรีสุข",
  "วารุณี ผิวอ่อน", "พิชัย ชัยชนะ", "อารีย์ พึ่งบุญ", "ธงชัย รักชาติ",
  "สายชล น้ำใส", "อนันต์ พันธ์ดี", "สมพร พรหมมินทร์", "จินตนา มณีส่อง"
];

const topics = [
  "น้ำประปาขุ่นสีแดง", "ท่อประปาแตกหน้าบ้าน", "น้ำไหลอ่อนมาก", "น้ำมีกลิ่นเหม็นคาว",
  "ไม่มีน้ำใช้มา 2 วัน", "มาตรวัดน้ำรั่ว", "ท่อประปารั่วซึม", "น้ำประปามีตะกอน"
];

const villages = [
  "หมู่ 1 บ้านโคกสว่าง", "หมู่ 2 บ้านหนองแวง", "หมู่ 3 บ้านโนนสูง", "หมู่ 4 บ้านนาคำ", "หมู่ 5 บ้านดอนแดง"
];

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
    { name: 'สมปอง ยอดเยี่ยม', phone: '081-999-8888', role: 'admin', note: 'หัวหน้างานบริหารระบบประปาหมู่บ้าน' },
    { name: 'มานพ ช่างประปา', phone: '082-777-6666', role: 'maintenance', note: 'เจ้าหน้าที่ซ่อมบำรุงและล้างถังกรองน้ำ' },
  ]);

  console.log('Inserting 20 Complaints...');
  const complaints = [];
  const statuses = ['รอดำเนินการ', 'รับงาน', 'กำลังดำเนินการ', 'เสร็จงาน'];
  for (let i = 0; i < 20; i++) {
    const v = villages[i % villages.length];
    const t = topics[i % topics.length];
    complaints.push({
      name: names[i],
      phone: `08${Math.floor(10000000 + Math.random() * 90000000)}`,
      topic: t,
      message: `แจ้งปัญหา${t} ที่ ${v} ซอย ${Math.floor(Math.random() * 5) + 1} รบกวนเจ้าหน้าที่เข้ามาตรวจสอบด้วยครับ/ค่ะ`,
      status: statuses[i % 4],
      submittedAt: new Date(Date.now() - (Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000))
    });
  }
  // Sort by date descending
  complaints.sort((a, b) => b.submittedAt - a.submittedAt);
  await ComplaintModel.insertMany(complaints);

  console.log('Inserting 20 Maintenance Logs...');
  const maintenanceReasons = [
    "ล้างถังกรองทราย", "เปลี่ยนสารกรองแมงกานีส", "ซ่อมปั๊มน้ำบาดาล", "ล้างตะกอนก้นถังพักน้ำใส",
    "ซ่อมรอยรั่วท่อเมนหลัก", "เติมคลอรีนแบบน้ำ", "ตรวจสอบระบบตู้คอนโทรลไฟฟ้า", "เปลี่ยนวาล์วน้ำหลัก"
  ];
  const logs = [];
  for (let i = 0; i < 20; i++) {
    const d = new Date(Date.now() - (i * 2 + 1) * 24 * 60 * 60 * 1000);
    logs.push({
      date: d.toISOString().split('T')[0],
      reason: maintenanceReasons[i % maintenanceReasons.length],
      note: `ดำเนินการเรียบร้อย ตรวจเช็คค่าความขุ่นน้ำหลังทำความสะอาดอยู่ในเกณฑ์มาตรฐาน`,
    });
  }
  await MaintenanceModel.insertMany(logs);

  console.log('Inserting 20 Plans...');
  const plans = [];
  for (let i = 0; i < 20; i++) {
    const d = new Date(Date.now() + (i - 5) * 5 * 24 * 60 * 60 * 1000); // Mix of past and future
    plans.push({
      scheduleDate: d.toISOString().split('T')[0],
      description: `ตรวจสอบประจำเดือน: ${maintenanceReasons[i % maintenanceReasons.length]}`,
      assignedTo: 'มานพ ช่างประปา',
      status: d.getTime() < Date.now() ? 'Completed' : 'Pending'
    });
  }
  await PlanModel.insertMany(plans);

  console.log('Inserting 20 History Records...');
  const histories = [];
  for (let i = 0; i < 20; i++) {
    const d = new Date(Date.now() - (i * 10) * 24 * 60 * 60 * 1000);
    histories.push({
      date: d.toISOString().split('T')[0],
      note: `บันทึกประวัติการบำรุงรักษา: ${maintenanceReasons[i % maintenanceReasons.length]} (ประจำงวดที่ ${i + 1})`,
    });
  }
  await HistoryModel.insertMany(histories);

  console.log('Seeding complete!');
  process.exit(0);
};

seedData();
