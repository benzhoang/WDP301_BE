const express = require("express");
const router = express.Router();
const bookingSessionController = require("../controllers/bookingSessionController");

router.get("/", bookingSessionController.getAllBookingSessions);
router.post("/", bookingSessionController.createBookingSession);
router.get("/member", bookingSessionController.getBookingSessionsByMember);
router.get("/consultant", bookingSessionController.getBookingSessionsByConsultant);
router.put("/:id/status-link", bookingSessionController.updateBookingSessionStatusAndLink);
router.delete("/:id", bookingSessionController.deleteBookingSession);
// Thêm các route khác nếu cần

module.exports = router; 