const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// GET /api/posts  - feed (own + people you follow), newest first
exports.getFeed = async (req, res) => {
  const me = await User.findById(req.user._id);
  const authors = [...me.following, me._id];
  const page = Number(req.query.page) || 1;
  const pageSize = 20;
  const posts = await Post.find({ author: { $in: authors } })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate('author', 'name username avatar');
  res.json({ posts });
};

// GET /api/posts/explore - all posts (public timeline)
exports.explore = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(30).populate('author', 'name username avatar');
  res.json({ posts });
};

// POST /api/posts
exports.createPost = async (req, res) => {
  const { text, image } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'Post text is required' });
  let post = await Post.create({ author: req.user._id, text: text.trim(), image: image || '' });
  post = await post.populate('author', 'name username avatar');
  res.status(201).json(post);
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not your post' });
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  res.json({ message: 'Post deleted' });
};

// POST /api/posts/:id/like  - toggle like
exports.toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const liked = post.likes.some((u) => u.toString() === req.user._id.toString());
  if (liked) post.likes.pull(req.user._id);
  else post.likes.addToSet(req.user._id);
  await post.save();
  res.json({ liked: !liked, likesCount: post.likes.length });
};

// GET /api/posts/:id/comments
exports.getComments = async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: 1 })
    .populate('author', 'name username avatar');
  res.json({ comments });
};

// POST /api/posts/:id/comments
exports.addComment = async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'Comment text required' });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  let comment = await Comment.create({ post: post._id, author: req.user._id, text: text.trim() });
  post.commentsCount += 1;
  await post.save();
  comment = await comment.populate('author', 'name username avatar');
  res.status(201).json(comment);
};
