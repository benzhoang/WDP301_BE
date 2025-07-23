const express = require("express");
const router = express.Router();
const bookingSessionController = require("../controllers/bookingSessionController");
const authentication = require("../middlewares/authentication"); // Thêm middleware xác thực

router.get("/", authentication, bookingSessionController.getAllBookingSessions);
router.post("/", authentication, bookingSessionController.createBookingSession);
router.get("/member", authentication, bookingSessionController.getBookingSessionsByMember);
router.get("/consultant/:consultantId", authentication, bookingSessionController.getBookingSessionsByConsultant);
router.put("/:id/status-link", authentication, bookingSessionController.updateBookingSessionStatusAndLink);
router.delete("/:id", authentication, bookingSessionController.deleteBookingSession);
router.put("/:bookingId", authentication, bookingSessionController.updateBookingSession);
router.get('/scheduled', authentication, bookingSessionController.getScheduledBookingSessions);
// Thêm các route khác nếu cần

module.exports = router;