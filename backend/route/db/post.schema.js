import mongoose from 'mongoose';
const { Schema } = mongoose;

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const PostSchema = new Schema({
  content: {
    type: String,
    required: function() {
      return !this.image && !this.isRetweet && !this.isQuoteRetweet;
    },
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  isRetweet: {
    type: Boolean,
    default: false
  },
  isQuoteRetweet: {
    type: Boolean,
    default: false
  },
  shareCount: {
    type: Number,
    default: 0
  },
  comments: [CommentSchema]
}, { collection: 'posts' });