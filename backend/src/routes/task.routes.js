const router = require('express').Router();
const {
  getTasks, createTask, getTask,
  updateTask, deleteTask, addComment, getDashboard,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', addComment);

module.exports = router;
