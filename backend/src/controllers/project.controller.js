const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { success, error } = require('../utils/response');
const { notifyProjectInvite } = require('../services/notification.service');
const { logActivity } = require('../services/activity.service');

exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    const projectsWithStats = await Promise.all(
      projects.map(async (p) => {
        const [total, done] = await Promise.all([
          Task.countDocuments({ project: p._id }),
          Task.countDocuments({ project: p._id, status: 'done' }),
        ]);
        return { ...p.toJSON(), taskCount: total, completedCount: done };
      })
    );

    success(res, { projects: projectsWithStats });
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [],
    });
    await project.populate('owner', 'name email avatar');
    success(res, { project }, 'Project created', 201);
  } catch (err) {
    next(err);
  }
};

exports.getProject = async (req, res) => {
  const project = req.project;
  await project.populate('members.user', 'name email avatar');
  const [tasks, total, done, overdue] = await Promise.all([
    Task.find({ project: project._id })
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ order: 1, createdAt: -1 }),
    Task.countDocuments({ project: project._id }),
    Task.countDocuments({ project: project._id, status: 'done' }),
    Task.countDocuments({ project: project._id, status: { $ne: 'done' }, dueDate: { $lt: new Date() } }),
  ]);
  success(res, { project, tasks, stats: { total, done, overdue } });
};

exports.updateProject = async (req, res, next) => {
  try {
    const { name, description, status, color } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.project._id,
      { name, description, status, color },
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');
    success(res, { project });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    await Task.deleteMany({ project: req.project._id });
    await Project.findByIdAndDelete(req.project._id);
    success(res, {}, 'Project deleted');
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return error(res, 'User not found', 404);

    const project = req.project;
    const isOwner = project.owner._id.toString() === userToAdd._id.toString();
    const alreadyMember = project.members.some(m => m.user.toString() === userToAdd._id.toString());

    if (isOwner || alreadyMember) return error(res, 'User is already in this project', 400);

    project.members.push({ user: userToAdd._id, role });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    await notifyProjectInvite(project._id, project.name, userToAdd._id, req.user._id);
    await logActivity({
      projectId: project._id, userId: req.user._id,
      action: `added ${userToAdd.name} as ${role}`, entity: 'member',
      entityId: userToAdd._id, entityTitle: userToAdd.name,
    });

    success(res, { project });
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project;

    if (project.owner._id.toString() === userId) return error(res, 'Cannot remove project owner', 400);

    project.members = project.members.filter(m => m.user.toString() !== userId);
    await project.save();
    await project.populate('members.user', 'name email avatar');
    success(res, { project });
  } catch (err) {
    next(err);
  }
};

exports.getActivity = async (req, res, next) => {
  try {
    const Activity = require('../models/Activity');
    const activities = await Activity.find({ project: req.project._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    success(res, { activities });
  } catch (err) {
    next(err);
  }
};
