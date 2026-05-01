const Task = require('../models/Task');
const Project = require('../models/Project');
const { success, error } = require('../utils/response');
const { notifyTaskAssigned, notifyTaskUpdated } = require('../services/notification.service');
const { logActivity } = require('../services/activity.service');

const populateTask = (query) =>
  query
    .populate('project', 'name color')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('comments.user', 'name avatar');

exports.getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignee, search, page = 1, limit = 100 } = req.query;
    const userId = req.user._id;

    const memberProjects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    }).select('_id');
    const allowedIds = memberProjects.map(p => p._id);

    const filter = { project: { $in: allowedIds } };
    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee === 'me' ? userId : assignee;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [tasks, total] = await Promise.all([
      populateTask(Task.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(Number(limit))),
      Task.countDocuments(filter),
    ]);

    success(res, { tasks, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignee, projectId, tags } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return error(res, 'Project not found', 404);

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isOwner && !isMember) return error(res, 'Not a project member', 403);

    const lastTask = await Task.findOne({ project: projectId, status: status || 'todo' })
      .sort({ order: -1 }).select('order');
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title, description, status, priority, dueDate,
      assignee: assignee || null, project: projectId,
      reporter: req.user._id, order, tags,
    });

    await populateTask(Task.findById(task._id)).then(async (t) => {
      if (assignee) await notifyTaskAssigned(t, assignee, req.user._id);
      await logActivity({
        projectId, userId: req.user._id,
        action: `created task "${title}"`, entity: 'task',
        entityId: t._id, entityTitle: title,
      });
    });

    const populated = await populateTask(Task.findById(task._id));
    success(res, { task: populated }, 'Task created', 201);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await populateTask(Task.findById(req.params.id));
    if (!task) return error(res, 'Task not found', 404);
    success(res, { task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignee, order, tags } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return error(res, 'Task not found', 404);

    const oldAssignee = task.assignee?.toString();
    const update = { title, description, status, priority, dueDate, tags };
    if (assignee !== undefined) update.assignee = assignee || null;
    if (order !== undefined) update.order = order;

    const updated = await populateTask(
      Task.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    );

    const newAssignee = update.assignee?.toString();
    if (newAssignee && newAssignee !== oldAssignee) {
      await notifyTaskAssigned(updated, newAssignee, req.user._id);
    }

    const project = await Project.findById(task.project);
    if (project) {
      await notifyTaskUpdated(updated, req.user._id, project.members);
      await logActivity({
        projectId: task.project, userId: req.user._id,
        action: `updated task "${updated.title}"`, entity: 'task',
        entityId: task._id, entityTitle: updated.title,
      });
    }

    success(res, { task: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return error(res, 'Task not found', 404);
    await task.deleteOne();
    success(res, {}, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: req.user._id, text } } },
      { new: true }
    );
    if (!task) return error(res, 'Task not found', 404);
    const populated = await populateTask(Task.findById(task._id));
    success(res, { task: populated });
  } catch (err) {
    next(err);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const memberProjects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    }).select('_id name');

    const projectIds = memberProjects.map(p => p._id);
    const now = new Date();

    const [total, completed, overdue, myTasks, byStatus, byPriority] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({ project: { $in: projectIds }, status: { $ne: 'done' }, dueDate: { $lt: now } }),
      Task.find({ project: { $in: projectIds }, assignee: userId, status: { $ne: 'done' } })
        .populate('project', 'name color')
        .populate('assignee', 'name avatar')
        .sort({ dueDate: 1, priority: -1 })
        .limit(10),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
    ]);

    success(res, {
      stats: { total, completed, overdue, inProgress: total - completed - overdue },
      myTasks,
      byStatus,
      byPriority,
      projects: memberProjects,
    });
  } catch (err) {
    next(err);
  }
};
