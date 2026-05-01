const Project = require('../models/Project');
const { error } = require('../utils/response');

// Attach project to req and verify membership
const loadProject = async (req, res, next) => {
  const project = await Project.findById(req.params.projectId || req.params.id).populate('owner', 'name email avatar');
  if (!project) return error(res, 'Project not found', 404);

  const isOwner = project.owner._id.toString() === req.user._id.toString();
  const member = project.members.find(m => m.user.toString() === req.user._id.toString());

  if (!isOwner && !member) return error(res, 'Access denied', 403);

  req.project = project;
  req.projectRole = isOwner ? 'admin' : member.role;
  next();
};

const requireProjectAdmin = (req, res, next) => {
  if (req.projectRole !== 'admin') return error(res, 'Project admin access required', 403);
  next();
};

module.exports = { loadProject, requireProjectAdmin };
