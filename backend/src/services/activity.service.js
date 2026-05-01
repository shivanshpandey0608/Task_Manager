const Activity = require('../models/Activity');

const logActivity = async ({ projectId, userId, action, entity, entityId, entityTitle }) => {
  try {
    await Activity.create({
      project: projectId,
      user: userId,
      action,
      entity,
      entityId,
      entityTitle,
    });
  } catch {
    // Non-critical — don't crash on log failure
  }
};

module.exports = { logActivity };
