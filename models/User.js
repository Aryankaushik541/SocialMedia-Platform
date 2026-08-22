const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    username: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
      minlength: 3, maxlength: 30, match: [/^[a-z0-9_]+$/, 'Username: letters, numbers, underscore only'],
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    bio: { type: String, default: '', maxlength: 200 },
    avatar: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Null-safe: these virtuals run on every toJSON, including queries that use
// .select() and therefore omit the followers/following arrays.
userSchema.virtual('followersCount').get(function () { return (this.followers || []).length; });
userSchema.virtual('followingCount').get(function () { return (this.following || []).length; });
userSchema.set('toJSON', { virtuals: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.matchPassword = function (entered) { return bcrypt.compare(entered, this.password); };

module.exports = mongoose.model('User', userSchema);
