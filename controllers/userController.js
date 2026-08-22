const User = require('../models/User');
const Post = require('../models/Post');

// GET /api/users/:username  - public profile
exports.getProfile = async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 }).populate('author', 'name username avatar');
  const isFollowing = req.user ? user.followers.some((f) => f.toString() === req.user._id.toString()) : false;
  res.json({ user, posts, isFollowing });
};

// PUT /api/users/me  - update own profile
exports.updateProfile = async (req, res) => {
  const { name, bio, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.json({ user });
};

// POST /api/users/:id/follow  - toggle follow
exports.toggleFollow = async (req, res) => {
  if (req.params.id === req.user._id.toString())
    return res.status(400).json({ message: "You can't follow yourself" });
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  const me = await User.findById(req.user._id);
  const already = me.following.some((f) => f.toString() === target._id.toString());
  if (already) {
    me.following.pull(target._id);
    target.followers.pull(me._id);
  } else {
    me.following.addToSet(target._id);
    target.followers.addToSet(me._id);
  }
  await me.save();
  await target.save();
  res.json({ following: !already, followersCount: target.followers.length });
};

// GET /api/users?search=  - discover people
exports.searchUsers = async (req, res) => {
  const q = req.query.search || '';
  const users = await User.find({
    $or: [{ username: new RegExp(q, 'i') }, { name: new RegExp(q, 'i') }],
    _id: { $ne: req.user._id },
  }).limit(20).select('name username avatar bio');
  res.json({ users });
};

// GET /api/users/me/suggestions - people you don't follow yet
exports.suggestions = async (req, res) => {
  const me = await User.findById(req.user._id);
  const users = await User.find({
    _id: { $nin: [...me.following, me._id] },
  }).limit(5).select('name username avatar bio');
  res.json({ users });
};
