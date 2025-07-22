const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.getAllStaff);
router.get('/stats', staffController.getStaffStatistics);
router.get('/search/:staffName', staffController.searchStaffByName);
router.post('/', staffController.createStaff);
router.put('/:staffId', staffController.updateStaff);
router.delete('/:staffId', staffController.deleteStaff);

module.exports = router; 