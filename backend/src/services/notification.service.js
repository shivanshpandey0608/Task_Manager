const Notification = require('../models/Notification');

const createNotification = async ({ recipient, sender, type, message, link = '', meta = {} }) => {
  if (recipient.toString() === sender?.toString()) return;
  await Notification.create({ recipient, sender, type, message, link, meta });
};

const notifyTaskAssigned = async (task, assigneeId, senderId) => {
  if (!assigneeId) return;
  await createNotification({
    recipient: assigneeId,
    sender: senderId,
    type: 'task_assigned',
    message: `You were assigned to task "${task.title}"`,
    link: `/projects/${task.project}/tasks/${task._id}`,
    meta: { taskId: task._id, projectId: task.project },
  });
};

const notifyTaskUpdated = async (task, updaterId, projectMembers) => {
  const recipients = projectMembers.filter(
    m => m.user.toString() !== updaterId.toString()
  );
  await Promise.all(
    recipients.map(m =>
      createNotification({
        recipient: m.user,
        sender: updaterId,
        type: 'task_updated',
        message: `Task "${task.title}" was updated`,
        link: `/projects/${task.project}/tasks/${task._id}`,
        meta: { taskId: task._id, projectId: task.project },
      })
    )
  );
};

const notifyProjectInvite = async (projectId, projectName, invitedUserId, inviterId) => {
  await createNotification({
    recipient: invitedUserId,
    sender: inviterId,
    type: 'project_invite',
    message: `You were added to project "${projectName}"`,
    link: `/projects/${projectId}`,
    meta: { projectId },
  });
};

module.exports = { notifyTaskAssigned, notifyTaskUpdated, notifyProjectInvite };
