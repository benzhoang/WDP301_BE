const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getDashboardStats);
router.get('/detailed', dashboardController.getDetailedDashboard);
router.get('/monthly-enrollment', dashboardController.getMonthlyCourseEnrollment);
router.get('/monthly-members', dashboardController.getMonthlyCreatedMembers);
router.get('/active-members', dashboardController.getActiveMembers);
router.get('/monthly-bookings', dashboardController.getMonthlyBookingSessions);
router.get('/consultant', dashboardController.getConsultantDashboard);

module.exports = router; 