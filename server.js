const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'dsd-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} ${hours}:${minutes}${ampm}`;
}

// Routes

// Main page - serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API: Get all entries (for main page)
app.get('/api/entries', (req, res) => {
  db.getAllEntries((err, entries) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(entries);
  });
});

// API: Search entries
app.get('/api/search', (req, res) => {
  const searchTerm = req.query.q || '';
  if (!searchTerm) {
    return db.getAllEntries((err, entries) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(entries);
    });
  }
  db.searchEntries(searchTerm, (err, entries) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(entries);
  });
});

// API: Filter by category
app.get('/api/category/:category', (req, res) => {
  db.filterByCategory(req.params.category, (err, entries) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(entries);
  });
});

// Entry page
app.get('/entry/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'entry.html'));
});

// API: Get single entry
app.get('/api/entry/:slug', (req, res) => {
  db.getEntryBySlug(req.params.slug, (err, entry) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    // Get media for this entry
    db.getMediaForEntry(entry.id, (err2, media) => {
      if (err2) {
        return res.status(500).json({ error: err2.message });
      }
      
      // Get adjacent entries
      db.getAdjacentEntries(entry.id, (err3, adjacent) => {
        if (err3) {
          return res.status(500).json({ error: err3.message });
        }
        
        // Parse media_paths if it exists
        if (entry.media_paths) {
          try {
            entry.media_paths = JSON.parse(entry.media_paths);
          } catch (e) {
            entry.media_paths = [];
          }
        }
        
        res.json({
          entry,
          media,
          prev: adjacent.prev,
          next: adjacent.next
        });
      });
    });
  });
});

// Admin login page
app.get('/admin/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/admin');
  }
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>admin login</title>
      <link rel="stylesheet" href="/css/main.css">
      <style>
        .login-container {
          max-width: 400px;
          margin: 100px auto;
          padding: 30px;
          border: 2px solid #4a3550;
        }
        .login-form input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          background: #2d1b3d;
          border: 1px solid #4a3550;
          color: #e8d5d0;
          font-family: 'Courier New', monospace;
        }
        .login-form button {
          width: 100%;
          padding: 12px;
          background: #8b5a7c;
          border: none;
          color: #e8d5d0;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-size: 16px;
        }
        .login-form button:hover {
          background: #c97a9e;
        }
        .error {
          color: #d4738f;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h1>admin login</h1>
        ${req.query.error ? '<p class="error">incorrect password</p>' : ''}
        <form method="POST" action="/admin/login" class="login-form">
          <input type="password" name="password" placeholder="password" required autofocus>
          <button type="submit">enter</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Admin login POST
app.post('/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login?error=1');
  }
});

// Admin logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Admin dashboard
app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Admin new entry page
app.get('/admin/new', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-edit.html'));
});

// Admin edit entry page
app.get('/admin/edit/:id', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-edit.html'));
});

// API: Create entry
app.post('/api/entry', requireAuth, upload.array('media', 10), (req, res) => {
  const entryData = {
    title: req.body.title,
    category: req.body.category,
    content_type: req.body.content_type || 'markdown',
    content: req.body.content
  };
  
  db.createEntry(entryData, (err, entryId) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const entryDir = path.join(__dirname, 'uploads', `entry-${entryId}`);
      if (!fs.existsSync(entryDir)) {
        fs.mkdirSync(entryDir, { recursive: true });
      }
      
      const mediaPaths = [];
      let processed = 0;
      
      req.files.forEach((file, index) => {
        const newPath = path.join(entryDir, file.filename);
        fs.rename(file.path, newPath, (err) => {
          if (err) {
            console.error('Error moving file:', err);
            return;
          }
          
          const relativePath = `/uploads/entry-${entryId}/${file.filename}`;
          mediaPaths.push(relativePath);
          
          // Determine file type
          let fileType = 'document';
          if (file.mimetype.startsWith('image/')) fileType = 'image';
          else if (file.mimetype.startsWith('video/')) fileType = 'video';
          else if (file.mimetype.startsWith('audio/')) fileType = 'audio';
          
          // Add to media table
          db.addMedia({
            entry_id: entryId,
            file_path: relativePath,
            file_type: fileType,
            display_order: index
          }, (err) => {
            if (err) console.error('Error adding media:', err);
            processed++;
            
            // When all files are processed, update entry
            if (processed === req.files.length) {
              db.updateEntry(entryId, {
                media_paths: JSON.stringify(mediaPaths),
                thumbnail_path: mediaPaths[0] || null
              }, (err) => {
                if (err) console.error('Error updating entry:', err);
                db.getEntryById(entryId, (err, entry) => {
                  res.json({ success: true, entry });
                });
              });
            }
          });
        });
      });
    } else {
      // No files uploaded
      db.getEntryById(entryId, (err, entry) => {
        res.json({ success: true, entry });
      });
    }
  });
});

// API: Update entry
app.put('/api/entry/:id', requireAuth, upload.array('media', 10), (req, res) => {
  const entryId = req.params.id;
  const entryData = {
    title: req.body.title,
    category: req.body.category,
    content_type: req.body.content_type,
    content: req.body.content
  };
  
  db.updateEntry(entryId, entryData, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      const entryDir = path.join(__dirname, 'uploads', `entry-${entryId}`);
      if (!fs.existsSync(entryDir)) {
        fs.mkdirSync(entryDir, { recursive: true });
      }
      
      // Get existing media
      db.getMediaForEntry(entryId, (err, existingMedia) => {
        const existingPaths = existingMedia.map(m => m.file_path);
        const newPaths = [];
        let processed = 0;
        
        req.files.forEach((file, index) => {
          const newPath = path.join(entryDir, file.filename);
          fs.rename(file.path, newPath, (err) => {
            if (err) {
              console.error('Error moving file:', err);
              return;
            }
            
            const relativePath = `/uploads/entry-${entryId}/${file.filename}`;
            newPaths.push(relativePath);
            
            let fileType = 'document';
            if (file.mimetype.startsWith('image/')) fileType = 'image';
            else if (file.mimetype.startsWith('video/')) fileType = 'video';
            else if (file.mimetype.startsWith('audio/')) fileType = 'audio';
            
            db.addMedia({
              entry_id: entryId,
              file_path: relativePath,
              file_type: fileType,
              display_order: existingMedia.length + index
            }, (err) => {
              if (err) console.error('Error adding media:', err);
              processed++;
              
              if (processed === req.files.length) {
                const allPaths = [...existingPaths, ...newPaths];
                db.updateEntry(entryId, {
                  media_paths: JSON.stringify(allPaths)
                }, () => {
                  db.getEntryById(entryId, (err, entry) => {
                    res.json({ success: true, entry });
                  });
                });
              }
            });
          });
        });
      });
    } else {
      db.getEntryById(entryId, (err, entry) => {
        res.json({ success: true, entry });
      });
    }
  });
});

// API: Delete entry
app.delete('/api/entry/:id', requireAuth, (req, res) => {
  const entryId = req.params.id;
  
  // Get entry first to delete files
  db.getEntryById(entryId, (err, entry) => {
    if (err || !entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    // Delete from database
    db.deleteEntry(entryId, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Delete files
      const entryDir = path.join(__dirname, 'uploads', `entry-${entryId}`);
      if (fs.existsSync(entryDir)) {
        fs.rmSync(entryDir, { recursive: true, force: true });
      }
      
      res.json({ success: true });
    });
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - not found</title>
      <link rel="stylesheet" href="/css/main.css">
      <style>
        .error-page {
          text-align: center;
          padding: 100px 20px;
        }
        .error-page h1 {
          font-size: 72px;
          margin: 0;
        }
        .error-page p {
          font-size: 24px;
          margin: 20px 0;
        }
        .error-page a {
          display: inline-block;
          margin-top: 30px;
          padding: 10px 20px;
          border: 2px solid #8b5a7c;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="error-page">
        <h1>404</h1>
        <p>page not found</p>
        <a href="/">← back home</a>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
});
