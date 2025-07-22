const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wdp301-super-secret-jwt-key-2025-secure';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: 'Account is not active. Please contact support.', status: user.status });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role || 'Member' }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role || 'Member',
        img_link: user.img_link || null,
        status: user.status
      },
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error during authentication', message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, role = 'member' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      status: 'active',
      img_link: null
    });
    const savedUser = await newUser.save();
    const token = jwt.sign({ userId: savedUser._id, email: savedUser.email, role: savedUser.role || 'Member' }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        img_link: savedUser.img_link
      },
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Registration failed', message: error.message });
  }
};

// Google login/register có thể bổ sung sau nếu cần
exports.googleLogin = async (req, res) => {
  res.json({ success: false, message: 'Google Login chưa được triển khai.' });
};
exports.googleRegister = async (req, res) => {
  res.json({ success: false, message: 'Google Register chưa được triển khai.' });
}; 