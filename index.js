const express = require("express");
require("dotenv").config();
const app = express();
const connectDB = require("./configs/db");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoute");
const profileRoutes = require("./routes/profileRoute");
const bookingRoutes = require("./routes/bookingRoute");
const categoryRoutes = require("./routes/categoryRoute");
const actionRoutes = require("./routes/actionRoute");
const assessmentRoutes = require("./routes/assessmentRoute");
const blogRoutes = require("./routes/blogRoute");
const bookingSessionRoutes = require("./routes/bookingSessionRoute");
const consoleLogRoutes = require("./routes/consoleLogRoute");
const consultantRoutes = require("./routes/consultantRoute");
const consultantSlotRoutes = require("./routes/consultantSlotRoute");
const contentRoutes = require("./routes/contentRoute");
const enrollRoutes = require("./routes/enrollRoute");
const flagRoutes = require("./routes/flagRoute");
const programRoutes = require("./routes/programRoute");
const slotRoutes = require("./routes/slotRoute");
const surveyRoutes = require("./routes/surveyRoute");
const surveyResponseRoutes = require("./routes/surveyResponseRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const authRoutes = require("./routes/authRoute");
const googleRoute = require("./routes/googleRoute");
const memberRoute = require("./routes/memberRoute");
const staffRoute = require("./routes/staffRoute");
const quizRoutes = require("./routes/quizRoute");
const assessmentQuestionRoutes = require("./routes/assessmentQuestionRoute");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.disable("etag");
// Mount user routes
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/booking-sessions", bookingSessionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/console-logs", consoleLogRoutes);
app.use("/api/consultants", consultantRoutes);
app.use("/api/consultant-slots", consultantSlotRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/enrollments", enrollRoutes);
app.use("/api/flags", flagRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/survey-responses", surveyResponseRoutes);
app.use("/api/dashboard", dashboardRoute);
app.use("/api", authRoutes);
app.use("/api/google", googleRoute);
app.use("/api/members", memberRoute);
app.use("/api/staff", staffRoute);
app.use("/api/quizzes", quizRoutes);
app.use("/api/assessment-questions", assessmentQuestionRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.json({
    message: "WDP301_BE API Server (MongoDB, Express, Clean Structure)",
  });
});

// Kết nối DB và khởi động server
connectDB().then(() => {
  const port = process.env.PORT || 'http://localhost:3000';
  console.log(port)
  app.listen(port, () => {
    console.log(`🚀 Server running at ${port}`);
    console.log(`📚 Swagger UI available at ${port}/api-docs`);
  });
});
