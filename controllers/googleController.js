const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const CLIENT_ID = process.env.CLIENT_ID;
const clientID = new OAuth2Client(CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'swp391-super-secret-jwt-key-2025-secure';

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential is required' });
    // Verify Google JWT token
    const ticket = await clientID.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;
    // Tìm user theo email + password = googleId
    let user = await User.findOne({ email, password: googleId });
    if (user) {
      // Đã có user, trả về token
      const token = jwt.sign({ userId: user._id, email: user.email, role: user.role || 'Member' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ message: 'Google login successful', user: { id: user._id, email: user.email, role: user.role || 'Member', img_link: user.img_link || null }, token });
    } else {
      // Chưa có user, tự động đăng ký
      return await exports.googleRegister(req, res, payload);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Google authentication failed', details: error.message });
  }
};

exports.googleRegister = async (req, res, payloadArg) => {
  try {
    const payload = payloadArg || (await (async () => {
      const { credential } = req.body;
      if (!credential) throw new Error('Google credential is required');
      const ticket = await clientID.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
      return ticket.getPayload();
    })());
    const { email, name, sub: googleId, picture } = payload;
    if (!email || !name || !googleId) return res.status(400).json({ error: 'Invalid Google token payload' });
    // Kiểm tra user đã tồn tại chưa
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, password: googleId, role: 'Member', status: 'active', img_link: picture });
      await user.save();
      // Có thể tạo profile nếu muốn
      // const profile = new Profile({ user_id: user._id, name });
      // await profile.save();
    }
    // Trả về token
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role || 'Member' }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(201).json({ message: 'Google registration successful', user: { id: user._id, email: user.email, role: user.role || 'Member', img_link: user.img_link || null }, token });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to register Google user', details: error.message });
  }
}; 