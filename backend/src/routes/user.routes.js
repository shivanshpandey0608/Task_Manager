const router = require('express').Router();
const { getUsers, getUserById } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
