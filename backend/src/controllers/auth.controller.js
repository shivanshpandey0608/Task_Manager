const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { success, error } = require('../utils/response');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return error(res, 'Email already registered', 400);

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    success(res, { token, user }, 'Account created', 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'Invalid email or password', 401);
    }
    const token = signToken(user._id);
    const userData = user.toJSON();
    success(res, { token, user: userData }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  success(res, { user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );
    success(res, { user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return error(res, 'Current password is incorrect', 400);
    }
    user.password = newPassword;
    await user.save();
    success(res, {}, 'Password updated');
  } catch (err) {
    next(err);
  }
};
