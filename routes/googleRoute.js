const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');

router.post('/login', googleController.googleLogin);
router.post('/register', googleController.googleRegister);

module.exports = router; 