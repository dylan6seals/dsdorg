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

// Generate slug from title before validation with collision handling
entrySchema.pre('validate', async function(next) {
  if (this.title && !this.slug) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Fallback if slug is empty after cleaning
    if (!baseSlug) {
      baseSlug = `entry-${Date.now()}`;
    }
    
    // Check for slug collisions and append number if needed
    let slug = baseSlug;
    let counter = 1;
    
    // Only check for collisions if this is a new document or slug changed
    if (this.isNew || this.isModified('title')) {
      while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    
    this.slug = slug;
  }
  next();
});

// Add indexes for better query performance
entrySchema.index({ slug: 1 }, { unique: true });
entrySchema.index({ createdAt: -1 });
entrySchema.index({ category: 1, createdAt: -1 });
entrySchema.index({ title: 'text', 'content.text': 'text', 'content.markdown': 'text' });

module.exports = mongoose.model('Entry', entrySchema);
