const express = require('express');
require('dotenv').config();
const app = express();
const connectDB = require('./configs/db');
const userRoutes = require('./routes/userRoute');
const profileRoutes = require('./routes/profileRoute');
const bookingRoutes = require('./routes/bookingRoute');
const productRoutes = require('./routes/productRoute');
const categoryRoutes = require('./routes/categoryRoute');
const reviewRoutes = require('./routes/reviewRoute');
const orderRoutes = require('./routes/orderRoute');
const cartRoutes = require('./routes/cartRoute');
const paymentRoutes = require('./routes/paymentRoute');
const actionRoutes = require('./routes/actionRoute');
const assessmentRoutes = require('./routes/assessmentRoute');
const blogRoutes = require('./routes/blogRoute');
const bookingSessionRoutes = require('./routes/bookingSessionRoute');
const consoleLogRoutes = require('./routes/consoleLogRoute');
const consultantRoutes = require('./routes/consultantRoute');
const consultantSlotRoutes = require('./routes/consultantSlotRoute');
const contentRoutes = require('./routes/contentRoute');
const enrollRoutes = require('./routes/enrollRoute');
const flagRoutes = require('./routes/flagRoute');
const programRoutes = require('./routes/programRoute');
const slotRoutes = require('./routes/slotRoute');
const surveyRoutes = require('./routes/surveyRoute');
const surveyResponseRoutes = require('./routes/surveyResponseRoute');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mount user routes
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/booking-sessions', bookingSessionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/console-logs', consoleLogRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/consultant-slots', consultantSlotRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/enrolls', enrollRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/survey-responses', surveyResponseRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({
    message: "WDP301_BE API Server (MongoDB, Express, Clean Structure)",
  });
});

// Kết nối DB và khởi động server
connectDB().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📚 Swagger UI available at http://localhost:${port}/api-docs`);
  });
});