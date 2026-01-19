const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'dsdorg.db');

// Create/open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize tables
function initializeDatabase() {
  db.serialize(() => {
    // Create entries table
    db.run(`
      CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        content_type TEXT,
        content TEXT,
        thumbnail_path TEXT,
        media_paths TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating entries table:', err.message);
      } else {
        console.log('Entries table ready');
      }
    });

    // Create media table
    db.run(`
      CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER,
        FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating media table:', err.message);
      } else {
        console.log('Media table ready');
      }
    });
  });
}

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Get all entries
function getAllEntries(callback) {
  const sql = `
    SELECT id, title, slug, category, created_at, thumbnail_path
    FROM entries
    ORDER BY created_at DESC
  `;
  db.all(sql, [], callback);
}

// Get single entry by slug
function getEntryBySlug(slug, callback) {
  const sql = `
    SELECT * FROM entries WHERE slug = ?
  `;
  db.get(sql, [slug], callback);
}

// Get entry by id
function getEntryById(id, callback) {
  const sql = `
    SELECT * FROM entries WHERE id = ?
  `;
  db.get(sql, [id], callback);
}

// Get media for an entry
function getMediaForEntry(entryId, callback) {
  const sql = `
    SELECT * FROM media
    WHERE entry_id = ?
    ORDER BY display_order ASC
  `;
  db.all(sql, [entryId], callback);
}

// Create new entry
function createEntry(entryData, callback) {
  const slug = createSlug(entryData.title);
  const sql = `
    INSERT INTO entries (title, slug, category, content_type, content, thumbnail_path, media_paths)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    entryData.title,
    slug,
    entryData.category,
    entryData.content_type || 'markdown',
    entryData.content || '',
    entryData.thumbnail_path || null,
    entryData.media_paths || null
  ];
  db.run(sql, params, function(err) {
    callback(err, this ? this.lastID : null);
  });
}

// Update entry
function updateEntry(id, entryData, callback) {
  const slug = entryData.title ? createSlug(entryData.title) : null;
  const sql = `
    UPDATE entries
    SET title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        category = COALESCE(?, category),
        content_type = COALESCE(?, content_type),
        content = COALESCE(?, content),
        thumbnail_path = COALESCE(?, thumbnail_path),
        media_paths = COALESCE(?, media_paths),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const params = [
    entryData.title || null,
    slug,
    entryData.category || null,
    entryData.content_type || null,
    entryData.content || null,
    entryData.thumbnail_path || null,
    entryData.media_paths || null,
    id
  ];
  db.run(sql, params, callback);
}

// Delete entry
function deleteEntry(id, callback) {
  db.serialize(() => {
    db.run('DELETE FROM media WHERE entry_id = ?', [id]);
    db.run('DELETE FROM entries WHERE id = ?', [id], callback);
  });
}

// Add media to entry
function addMedia(mediaData, callback) {
  const sql = `
    INSERT INTO media (entry_id, file_path, file_type, caption, display_order)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    mediaData.entry_id,
    mediaData.file_path,
    mediaData.file_type,
    mediaData.caption || null,
    mediaData.display_order || 0
  ];
  db.run(sql, params, callback);
}

// Search entries
function searchEntries(searchTerm, callback) {
  const sql = `
    SELECT id, title, slug, category, created_at, thumbnail_path
    FROM entries
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY created_at DESC
  `;
  const searchPattern = `%${searchTerm}%`;
  db.all(sql, [searchPattern, searchPattern], callback);
}

// Filter entries by category
function filterByCategory(category, callback) {
  const sql = `
    SELECT id, title, slug, category, created_at, thumbnail_path
    FROM entries
    WHERE category = ?
    ORDER BY created_at DESC
  `;
  db.all(sql, [category], callback);
}

// Get next and previous entries
function getAdjacentEntries(currentId, callback) {
  db.serialize(() => {
    // Get previous entry (older)
    db.get(`
      SELECT id, slug, title FROM entries
      WHERE id < ?
      ORDER BY id DESC
      LIMIT 1
    `, [currentId], (err, prev) => {
      // Get next entry (newer)
      db.get(`
        SELECT id, slug, title FROM entries
        WHERE id > ?
        ORDER BY id ASC
        LIMIT 1
      `, [currentId], (err2, next) => {
        callback(err || err2, { prev, next });
      });
    });
  });
}

module.exports = {
  db,
  getAllEntries,
  getEntryBySlug,
  getEntryById,
  getMediaForEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  addMedia,
  searchEntries,
  filterByCategory,
  getAdjacentEntries,
  createSlug
};
