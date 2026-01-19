# API Documentation

Complete reference for DSD.ORG API endpoints.

## Base URL

- **Local Development**: `http://localhost:3000/api`
- **Production**: `https://dylanseals.org/api`

## Authentication

Most write operations require JWT authentication.

### Obtaining a Token

**POST** `/api/auth`

Request body:
```json
{
  "password": "your_admin_password"
}
```

Success response (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Error response (401):
```json
{
  "error": "Invalid password"
}
```

### Using the Token

Include token in Authorization header for authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires after 24 hours.

## Entries Endpoint

**Base**: `/api/entries`

### Get All Entries

**GET** `/api/entries`

No authentication required.

Response (200):
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "My First Entry",
    "slug": "my-first-entry",
    "category": "text",
    "contentType": "markdown",
    "content": "# Hello World\n\nThis is my first entry.",
    "media": [],
    "thumbnailPath": null,
    "createdAt": "2026-01-19T12:00:00.000Z",
    "updatedAt": "2026-01-19T12:00:00.000Z"
  }
]
```

### Get Single Entry by Slug

**GET** `/api/entries?slug={slug}`

No authentication required.

Parameters:
- `slug` (string, required): Entry slug

Response (200):
```json
{
  "entry": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "My First Entry",
    "slug": "my-first-entry",
    "category": "text",
    "contentType": "markdown",
    "content": "# Hello World\n\nThis is my first entry.",
    "media": [
      {
        "filePath": "https://res.cloudinary.com/.../image.jpg",
        "fileType": "image",
        "caption": "A test image",
        "displayOrder": 0
      }
    ],
    "thumbnailPath": "https://res.cloudinary.com/.../image.jpg",
    "createdAt": "2026-01-19T12:00:00.000Z",
    "updatedAt": "2026-01-19T12:00:00.000Z"
  },
  "prev": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k0",
    "slug": "previous-entry",
    "title": "Previous Entry"
  },
  "next": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "slug": "next-entry",
    "title": "Next Entry"
  }
}
```

Error (404):
```json
{
  "error": "Entry not found"
}
```

### Search Entries

**GET** `/api/entries?search={query}`

No authentication required.

Parameters:
- `search` (string, required): Search term (searches title and content)

Returns array of matching entries (same format as Get All Entries).

### Filter by Category

**GET** `/api/entries?category={category}`

No authentication required.

Parameters:
- `category` (string, required): One of: `text`, `image`, `video`, `audio`, `mixed`, `link`, `code`, `other`

Returns array of entries in that category.

### Create Entry

**POST** `/api/entries`

**Authentication required.**

Request body:
```json
{
  "title": "New Entry Title",
  "category": "text",
  "contentType": "markdown",
  "content": "Entry content here..."
}
```

Success response (201):
```json
{
  "success": true,
  "entry": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "New Entry Title",
    "slug": "new-entry-title",
    "category": "text",
    "contentType": "markdown",
    "content": "Entry content here...",
    "media": [],
    "thumbnailPath": null,
    "createdAt": "2026-01-19T12:00:00.000Z",
    "updatedAt": "2026-01-19T12:00:00.000Z"
  }
}
```

Error (401):
```json
{
  "error": "Unauthorized"
}
```

### Update Entry

**PUT** `/api/entries?id={entryId}`

**Authentication required.**

Parameters:
- `id` (string, required): Entry MongoDB ObjectId

Request body (partial updates supported):
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

Success response (200):
```json
{
  "success": true,
  "entry": { /* updated entry object */ }
}
```

Error (404):
```json
{
  "error": "Entry not found"
}
```

### Delete Entry

**DELETE** `/api/entries?id={entryId}`

**Authentication required.**

Parameters:
- `id` (string, required): Entry MongoDB ObjectId

Success response (200):
```json
{
  "success": true
}
```

Error (404):
```json
{
  "error": "Entry not found"
}
```

## Upload Endpoint

**Base**: `/api/upload`

### Upload Media Files

**POST** `/api/upload`

**Authentication required.**

Content-Type: `multipart/form-data`

Form fields:
- `media` (file, multiple): Media files to upload (max 10 files, 50MB each)
- `entryId` (string, optional): Existing entry ID to add media to
- `title` (string, optional): Title for new entry
- `category` (string, optional): Category for new entry
- `contentType` (string, optional): Content type for new entry
- `content` (string, optional): Content for new entry

**Example 1: Upload files to existing entry**

```javascript
const formData = new FormData();
formData.append('entryId', '65a1b2c3d4e5f6g7h8i9j0k1');
formData.append('media', file1);
formData.append('media', file2);

fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Example 2: Create new entry with files**

```javascript
const formData = new FormData();
formData.append('title', 'Photo Gallery');
formData.append('category', 'image');
formData.append('contentType', 'markdown');
formData.append('content', 'My photo collection');
formData.append('media', file1);
formData.append('media', file2);

fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

Success response (200 for update, 201 for create):
```json
{
  "success": true,
  "entry": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Photo Gallery",
    "media": [
      {
        "filePath": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/dsdorg/abc123.jpg",
        "fileType": "image",
        "caption": "",
        "displayOrder": 0
      }
    ],
    "thumbnailPath": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/dsdorg/abc123.jpg"
  }
}
```

Supported file types:
- **Images**: jpg, jpeg, png, gif, webp, svg
- **Videos**: mp4, webm, mov, avi
- **Audio**: mp3, wav, ogg, m4a

File upload limits:
- Max file size: 50MB per file
- Max files per request: 10
- Total upload size limited by Cloudinary account (25GB free tier)

Error responses:

Upload too large (500):
```json
{
  "error": "File too large. Maximum size is 50MB."
}
```

Unauthorized (401):
```json
{
  "error": "Unauthorized - Invalid or missing token"
}
```

Entry not found (404):
```json
{
  "error": "Entry not found"
}
```

## Error Responses

All endpoints may return these standard errors:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized - Invalid or missing token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 405 Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message describing what went wrong"
}
```

## Rate Limiting

Currently no rate limiting implemented. Consider implementing if experiencing abuse.

## CORS

CORS configured to allow:
- **Development**: All origins (`*`)
- **Production**: `https://dylanseals.org` only

Allowed methods: GET, POST, PUT, DELETE, OPTIONS

## Data Models

### Entry Schema

```javascript
{
  _id: ObjectId,              // MongoDB ID
  title: String,              // Entry title (required)
  slug: String,               // URL-friendly slug (auto-generated)
  category: String,           // One of: text, image, video, audio, mixed, link, code, other
  contentType: String,        // 'markdown' or 'html'
  content: String,            // Entry body text
  thumbnailPath: String,      // URL to thumbnail image (auto-selected from first image)
  mediaPaths: [String],       // Deprecated - kept for backwards compatibility
  media: [{                   // Array of media attachments
    filePath: String,         // Cloudinary URL
    fileType: String,         // 'image', 'video', 'audio', or 'document'
    caption: String,          // Optional caption
    displayOrder: Number      // Display order (0-indexed)
  }],
  createdAt: Date,            // Auto-generated
  updatedAt: Date             // Auto-updated on save
}
```

## Usage Examples

### React/Axios

```javascript
import axios from 'axios';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: '/api'
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all entries
const entries = await api.get('/entries');

// Create entry
const newEntry = await api.post('/entries', {
  title: 'My Entry',
  category: 'text',
  contentType: 'markdown',
  content: '# Hello'
});

// Upload files
const formData = new FormData();
formData.append('entryId', newEntry.data.entry._id);
formData.append('media', file);

await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Fetch API

```javascript
// Login
const response = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'your_password' })
});
const { token } = await response.json();
localStorage.setItem('adminToken', token);

// Create entry (authenticated)
const createResponse = await fetch('/api/entries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Entry',
    category: 'text',
    contentType: 'markdown',
    content: '# Hello'
  })
});
```

### cURL

```bash
# Login
curl -X POST https://dylanseals.org/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"your_password"}'

# Get entries
curl https://dylanseals.org/api/entries

# Get single entry
curl "https://dylanseals.org/api/entries?slug=my-first-entry"

# Create entry (authenticated)
curl -X POST https://dylanseals.org/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"New Entry","category":"text","contentType":"markdown","content":"# Hello"}'

# Upload file (authenticated)
curl -X POST https://dylanseals.org/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "entryId=65a1b2c3d4e5f6g7h8i9j0k1" \
  -F "media=@/path/to/image.jpg"
```

## Best Practices

1. **Always validate tokens on the client** before making authenticated requests
2. **Handle token expiration gracefully** - redirect to login on 401 errors
3. **Use slugs for public URLs** - more SEO-friendly than IDs
4. **Compress images before upload** - faster uploads, lower bandwidth usage
5. **Cache GET requests** - reduce API calls for frequently accessed data
6. **Implement retry logic** for failed uploads (network issues)
7. **Show upload progress** for better UX on large files

## Security Notes

- All write operations require valid JWT token
- Passwords should be bcrypt hashed in production
- CORS restricted to production domain
- MongoDB connection uses SSL by default
- Cloudinary URLs are signed (can't be guessed/enumerated)
- Input is sanitized with sanitize-html library
- Tokens expire after 24 hours
- No rate limiting currently - monitor for abuse

---

**Version**: 1.0.0  
**Last Updated**: January 19, 2026  
**Base URL**: https://dylanseals.org/api
