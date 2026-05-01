const router = require('express').Router();
const {
  getProjects, createProject, getProject,
  updateProject, deleteProject, addMember, removeMember, getActivity,
} = require('../controllers/project.controller');
const { protect } = require('../middleware/auth');
const { loadProject, requireProjectAdmin } = require('../middleware/projectAccess');

router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);

router.get('/:id', loadProject, getProject);
router.put('/:id', loadProject, requireProjectAdmin, updateProject);
router.delete('/:id', loadProject, requireProjectAdmin, deleteProject);

router.post('/:id/members', loadProject, requireProjectAdmin, addMember);
router.delete('/:id/members/:userId', loadProject, requireProjectAdmin, removeMember);
router.get('/:id/activity', loadProject, getActivity);

module.exports = router;
