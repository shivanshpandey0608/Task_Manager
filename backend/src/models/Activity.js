const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, enum: ['task', 'project', 'member'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityTitle: { type: String, default: '' },
  },
  { timestamps: true }
);

activitySchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
