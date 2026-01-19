const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['text', 'image', 'video', 'audio', 'mixed', 'link', 'code', 'other'],
    default: 'text'
  },
  contentType: {
    type: String,
    enum: ['markdown', 'html'],
    default: 'markdown'
  },
  content: {
    type: String,
    default: ''
  },
  thumbnailPath: {
    type: String,
    default: null
  },
  mediaPaths: [{
    type: String
  }],
  media: [{
    filePath: String,
    fileType: {
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    },
    caption: String,
    displayOrder: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update updatedAt on save
entrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from title before validation
entrySchema.pre('validate', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Entry', entrySchema);
