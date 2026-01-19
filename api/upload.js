const { upload } = require('./config/cloudinary');
const Entry = require('./models/Entry');
const connectDB = require('./config/db');
const { requireAuth } = require('./middleware/auth');

// Set CORS headers helper
const setCorsHeaders = (res) => {
  const origin = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === 'production'
    ? 'https://dylanseals.org'
    : 'http://localhost:3000'; // Changed from '*' for credentials support
    
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

const handleUpload = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      await connectDB();

      // Handle multipart form data with multer
      upload.array('files', 10)(req, res, async (err) => {
        if (err) {
          console.error('Upload error:', err);
          return res.status(500).json({ error: 'File upload failed' });
        }

        const { entryId, title, category, contentType, content } = req.body;

        if (entryId) {
          // Update existing entry with new media
          const entry = await Entry.findById(entryId);
          if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
          }

          if (req.files && req.files.length > 0) {
            const newMedia = req.files.map((file, index) => ({
              filePath: file.path,
              fileType: file.mimetype.startsWith('image/') ? 'image' :
                       file.mimetype.startsWith('video/') ? 'video' :
                       file.mimetype.startsWith('audio/') ? 'audio' : 'document',
              displayOrder: (entry.media?.length || 0) + index
            }));

            entry.media = [...(entry.media || []), ...newMedia];
            if (!entry.thumbnailPath && newMedia[0]?.fileType === 'image') {
              entry.thumbnailPath = newMedia[0].filePath;
            }

            await entry.save();
          }

          return res.status(200).json({ success: true, entry });
        } else {
          // Create new entry with media
          const entryData = {
            title,
            category,
            contentType,
            content
          };

          if (req.files && req.files.length > 0) {
            entryData.media = req.files.map((file, index) => ({
              filePath: file.path,
              fileType: file.mimetype.startsWith('image/') ? 'image' :
                       file.mimetype.startsWith('video/') ? 'video' :
                       file.mimetype.startsWith('audio/') ? 'audio' : 'document',
              displayOrder: index
            }));

            const firstImage = entryData.media.find(m => m.fileType === 'image');
            if (firstImage) {
              entryData.thumbnailPath = firstImage.filePath;
            }
          }

          const newEntry = new Entry(entryData);
          await newEntry.save();

          return res.status(201).json({ success: true, entry: newEntry });
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

// Export with authentication middleware
module.exports = requireAuth(handleUpload);
