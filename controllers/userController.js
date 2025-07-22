const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json({
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, '-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user, message: 'User retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { role, password, status, email, img_link } = req.body;
    if (!role || !password || !status || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields: role, password, status, email' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      role,
      password: hashedPassword,
      status,
      email,
      img_link: img_link || null
    });
    const savedUser = await newUser.save();
    const userObj = savedUser.toObject();
    delete userObj.password;
    res.status(201).json({ success: true, data: userObj, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, password, status, email, img_link } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (status) user.status = status;
    if (email) user.email = email;
    if (img_link !== undefined) user.img_link = img_link;
    const updatedUser = await user.save();
    const userObj = updatedUser.toObject();
    delete userObj.password;
    res.status(200).json({ success: true, data: userObj, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status === 'inactive') {
      return res.status(400).json({ success: false, message: 'User is already inactive', user: { id: user._id, email: user.email, role: user.role, status: user.status, img_link: user.img_link } });
    }
    user.status = 'inactive';
    const updatedUser = await user.save();
    res.status(200).json({ success: true, message: `User with ID ${id} deactivated successfully`, deactivatedUser: { id: updatedUser._id, email: updatedUser.email, role: updatedUser.role, status: updatedUser.status, img_link: updatedUser.img_link } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to deactivate user', error: error.message });
  }
};

exports.getUserProfileCombined = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required from token' });
    const user = await User.findById(userId, '-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const profile = await Profile.findOne({ user_id: userId });
    res.status(200).json({
      success: true,
      data: {
        user,
        profile: profile || null,
        hasProfile: !!profile
      },
      message: 'User and profile data retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user and profile data', error: error.message });
  }
};

exports.updateUserProfileCombined = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required from token' });
    const { email, role, status, img_link, name, bio_json, date_of_birth, job } = req.body;
    // Update user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (img_link !== undefined) user.img_link = img_link;
    await user.save();
    // Update or create profile
    let profile = await Profile.findOne({ user_id: userId });
    if (name !== undefined || bio_json !== undefined || date_of_birth !== undefined || job !== undefined) {
      if (!profile) {
        profile = new Profile({ user_id: userId });
      }
      if (name !== undefined) profile.name = name;
      if (bio_json !== undefined) {
        try {
          if (bio_json && typeof bio_json === 'string') JSON.parse(bio_json);
          profile.bio_json = bio_json;
        } catch (e) {
          return res.status(400).json({ success: false, message: 'Invalid bio_json format' });
        }
      }
      if (date_of_birth !== undefined) profile.date_of_birth = date_of_birth;
      if (job !== undefined) profile.job = job;
      await profile.save();
    }
    res.status(200).json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, role: user.role, status: user.status, img_link: user.img_link },
        profile: profile || null,
        hasProfile: !!profile
      },
      message: 'User and profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user and profile data', error: error.message });
  }
};

exports.deleteUserCascade = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required from token' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status === 'inactive') {
      return res.status(400).json({ success: false, message: 'User account is already deactivated', user: { id: user._id, email: user.email, role: user.role, status: user.status, img_link: user.img_link } });
    }
    const profile = await Profile.findOne({ user_id: userId });
    user.status = 'inactive';
    await user.save();
    res.status(200).json({
      success: true,
      message: 'User account deactivated successfully',
      deactivatedData: {
        user: { id: user._id, email: user.email, role: user.role, status: user.status, img_link: user.img_link },
        profile: profile || null,
        softDeleted: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to deactivate user account', error: error.message });
  }
};

exports.getUserRoleById = async (req, res) => {
  try {
    const role = req.user.role;
    if (!role) {
      return res.status(404).json({ success: false, message: 'Invalid role' });
    }
    res.status(200).json({ success: true, message: 'Successfully get the Role from user', role });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error in the server', error: err.message });
  }
}; 