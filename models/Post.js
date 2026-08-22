const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    image: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Null-safe so toJSON never crashes if `likes` wasn't selected in a query.
postSchema.virtual('likesCount').get(function () { return (this.likes || []).length; });
postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
