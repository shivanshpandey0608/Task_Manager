const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 250 },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date, default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Number, default: 0 },
    comments: [commentSchema],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
