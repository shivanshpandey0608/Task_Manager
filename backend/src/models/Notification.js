const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: {
      type: String,
      enum: ['task_assigned', 'task_updated', 'task_commented', 'project_invite', 'project_updated'],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);