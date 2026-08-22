require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

(async () => {
  try {
    await connectDB();
    await Promise.all([User.deleteMany(), Post.deleteMany(), Comment.deleteMany()]);

    const users = await User.create([
      { name: 'Aryan Sharma', username: 'aryan', email: 'aryan@demo.com', password: 'password123', bio: 'Full-stack dev · building things', avatar: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Priya Verma', username: 'priya', email: 'priya@demo.com', password: 'password123', bio: 'Designer & coffee lover', avatar: 'https://i.pravatar.cc/150?img=45' },
      { name: 'Rahul Nair', username: 'rahul', email: 'rahul@demo.com', password: 'password123', bio: 'Photographer 📷', avatar: 'https://i.pravatar.cc/150?img=33' },
    ]);

    // aryan follows priya and rahul
    users[0].following.push(users[1]._id, users[2]._id);
    users[1].followers.push(users[0]._id);
    users[2].followers.push(users[0]._id);
    await Promise.all(users.map((u) => u.save()));

    const posts = await Post.create([
      { author: users[1]._id, text: 'Just shipped a new design system! 🎨', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600' },
      { author: users[2]._id, text: 'Golden hour never disappoints.', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600' },
      { author: users[0]._id, text: 'Learning WebSockets today. Real-time is fun!' },
    ]);
    await Comment.create({ post: posts[0]._id, author: users[0]._id, text: 'This looks amazing 🔥' });
    posts[0].commentsCount = 1;
    posts[0].likes.push(users[0]._id, users[2]._id);
    await posts[0].save();

    console.log('Seeded 3 users (login: aryan@demo.com / password123), 3 posts, 1 comment');
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
})();
