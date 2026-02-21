const Entry = require('./models/Entry');
const connectDB = require('./config/db');
const { requireAuth, optionalAuth } = require('./middleware/auth');
const { validateEnv } = require('./config/validate-env');
const sanitizeHtml = require('sanitize-html');

// Set CORS headers helper
const setCorsHeaders = (res) => {
  const origin = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === 'production'
    ? 'https://dylanseals.org'
    : 'http://localhost:3000'; // Changed from '*' for credentials support
    
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

// Sanitize entry content
const sanitizeEntry = (data) => {
  if (data.content && data.contentType === 'html') {
    data.content = sanitizeHtml(data.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'video', 'audio', 'iframe']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class', 'id', 'style'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'video': ['src', 'controls', 'width', 'height'],
        'audio': ['src', 'controls'],
        'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen']
      }
    });
  }
  return data;
};

const handleRequest = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    validateEnv();
    await connectDB();

    // GET requests don't need authentication
    if (req.method === 'GET') {
      const { slug, search, category, id } = req.query;

      // Get single entry by ID
      if (id) {
        const entry = await Entry.findById(id);
        if (!entry) {
          return res.status(404).json({ error: 'Entry not found' });
        }
        return res.status(200).json(entry);
      }

      // Get single entry by slug
      if (slug) {
        const entry = await Entry.findOne({ slug });
        if (!entry) {
          return res.status(404).json({ error: 'Entry not found' });
        }

        // Get adjacent entries for navigation (using createdAt for proper chronological order)
        const prevEntry = await Entry.findOne({ createdAt: { $lt: entry.createdAt } })
          .sort({ createdAt: -1 })
          .limit(1)
          .select('slug title');
        
        const nextEntry = await Entry.findOne({ createdAt: { $gt: entry.createdAt } })
          .sort({ createdAt: 1 })
          .limit(1)
          .select('slug title');

        return res.status(200).json({
          entry,
          prev: prevEntry,
          next: nextEntry
        });
      }

      // Search entries
      if (search) {
        const entries = await Entry.find({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ]
        }).sort({ createdAt: -1 });
        return res.status(200).json(entries);
      }

      // Filter by category
      if (category) {
        const entries = await Entry.find({ category }).sort({ createdAt: -1 });
        return res.status(200).json(entries);
      }

      // Get all entries
      const entries = await Entry.find().sort({ createdAt: -1 });
      return res.status(200).json(entries);
    }

    // POST, PUT, DELETE require authentication
    if (req.method === 'POST') {
      // Verify authentication
      if (!req.user || !req.user.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const sanitizedData = sanitizeEntry(req.body);
      const newEntry = new Entry(sanitizedData);
      await newEntry.save();
      return res.status(201).json({ success: true, entry: newEntry });
    }

    if (req.method === 'PUT') {
      // Verify authentication
      if (!req.user || !req.user.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { id } = req.query;
      const sanitizedData = sanitizeEntry(req.body);
      const updatedEntry = await Entry.findByIdAndUpdate(id, sanitizedData, { new: true });
      if (!updatedEntry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      return res.status(200).json({ success: true, entry: updatedEntry });
    }

    if (req.method === 'DELETE') {
      // Verify authentication
      if (!req.user || !req.user.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { id } = req.query;
      const deletedEntry = await Entry.findByIdAndDelete(id);
      if (!deletedEntry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    // Don't expose internal error details to client
    return res.status(500).json({ error: 'An error occurred processing your request' });
  }
};

// Export with optional auth - GET is public, POST/PUT/DELETE check auth inside handler
module.exports = optionalAuth(handleRequest);
