const express=require('express');
const cors=require('cors');
const swaggerUi=require('swagger-ui-express');
const swaggerDocument=require('./swagger.json');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app=express();
app.use(cors());
app.use(express.json());

app.use('/api/water',require('./routes/water'));
app.use('/api/maintenance',require('./routes/maintenance'));
app.use('/api/history',require('./routes/history'));
app.use('/api/alert',require('./routes/alert'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/docs',swaggerUi.serve,swaggerUi.setup(swaggerDocument));

const port=process.env.PORT||5000;
app.listen(port,()=>{
 console.log(`Server running on port ${port}`);
 console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
});
