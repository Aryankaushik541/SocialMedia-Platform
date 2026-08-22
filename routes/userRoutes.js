const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const h = require('../middleware/asyncHandler');
const {
  getProfile, updateProfile, toggleFollow, searchUsers, suggestions,
} = require('../controllers/userController');

const router = express.Router();

router.get('/', protect, h(searchUsers));
router.get('/me/suggestions', protect, h(suggestions));
router.put('/me', protect, h(updateProfile));
router.post('/:id/follow', protect, h(toggleFollow));
router.get('/:username', optionalAuth, h(getProfile));

module.exports = router;
