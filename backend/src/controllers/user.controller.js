const User = require('../models/User');
const { success } = require('../utils/response');

exports.getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).select('name email avatar role').limit(50);
    success(res, { users });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name email avatar role createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    success(res, { user });
  } catch (err) {
    next(err);
  }
};
