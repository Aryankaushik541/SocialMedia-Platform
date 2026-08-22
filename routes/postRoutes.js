const express = require('express');
const { protect } = require('../middleware/auth');
const h = require('../middleware/asyncHandler');
const {
  getFeed, explore, createPost, deletePost, toggleLike, getComments, addComment,
} = require('../controllers/postController');

const router = express.Router();

router.get('/', protect, h(getFeed));
router.get('/explore', protect, h(explore));
router.post('/', protect, h(createPost));
router.delete('/:id', protect, h(deletePost));
router.post('/:id/like', protect, h(toggleLike));
router.get('/:id/comments', protect, h(getComments));
router.post('/:id/comments', protect, h(addComment));

module.exports = router;
