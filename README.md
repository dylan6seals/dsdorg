# DSD.ORG - Personal Life Portfolio

A personal website for documenting life entries with a moody, early-internet aesthetic. Built with the MERN stack (MongoDB, Express, React, Node.js) and deployed on Vercel.

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get running locally in 15 minutes
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Complete production deployment guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Full API endpoint reference
- **[MIGRATION.md](MIGRATION.md)** - Architecture migration details from vanilla JS

## 🎨 Features

- **Timeline View**: Entries organized chronologically by year
- **Rich Media Support**: Upload and display images, videos, and audio files via Cloudinary
- **Search & Filter**: Real-time search and category filtering
- **Markdown Support**: Write content in Markdown or HTML
- **Admin Interface**: Secure JWT-authenticated admin panel for managing entries
- **Responsive Design**: Works beautifully on all devices
- **Early Internet Aesthetic**: Moody romantic color scheme with intentional "human feel"
- **File Upload Progress**: Visual progress tracking with percentage display
- **Error Boundaries**: Graceful error handling prevents app crashes

## 🏗️ Architecture

### Frontend
- **React 19** with Vite for fast development
- **React Router** for SPA navigation
- **Axios** for API communication with JWT token management
- **Marked** for Markdown rendering
- **Error Boundaries** for robust error handling

### Backend
- **Vercel Serverless Functions** for API endpoints
- **MongoDB Atlas** (free M0 tier) for database
- **Mongoose** for object modeling
- **Cloudinary** (free 25GB tier) for media storage
- **JWT** for authentication with 24-hour expiration
- **bcrypt** for password hashing
- **Multer** + **CloudinaryStorage** for file uploads
- **sanitize-html** for input sanitization

### Deployment
- **Vercel** for hosting and serverless functions
- **MongoDB Atlas** cloud database
- **Cloudinary** cloud media storage
- **Namecheap** DNS for custom domain (dylanseals.org)

## 🚀 Quick Start (Local Development)

**See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.**

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free at mongodb.com/cloud/atlas)
- Cloudinary account (free at cloudinary.com)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dylan6seals/dsdorg.git
cd dsdorg
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dsdorg
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. **Start development server**
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

## 📝 Usage

### Creating Entries

1. Navigate to `/admin/login`
2. Enter your admin password
3. Click "new entry"
4. Fill in title, category, content type, and content
5. Optionally upload media files (images, videos, audio)
6. Click "create entry" to publish

### Managing Media

- Upload multiple files at once (max 10 files, 50MB each)
- Files stored on Cloudinary for reliable global CDN delivery
- Thumbnails automatically selected from first image
- Supports: images, videos, audio files

## 🌐 Deployment to Vercel

See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for comprehensive deployment instructions.

Quick summary:
1. Set up MongoDB Atlas (free tier)
2. Set up Cloudinary account (free tier)
3. Deploy to Vercel with environment variables
4. Configure custom domain (dylanseals.org)

## 📁 Project Structure

```
dsdorg/
├── api/                      # Vercel serverless functions
│   ├── middleware/auth.js   # JWT authentication
│   ├── models/Entry.js      # Mongoose schema
│   ├── config/              # DB & Cloudinary config
│   ├── auth.js              # Login endpoint
│   ├── entries.js           # CRUD operations
│   └── upload.js            # File upload handler
├── src/                      # React frontend
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── styles/              # CSS files
│   ├── utils/api.js         # Axios instance
│   └── main.jsx             # React entry point
├── .env.example             # Environment template
├── vercel.json              # Vercel config
├── vite.config.js           # Vite build config
└── README.md                # This file
```

## 🎨 Customization

### Color Scheme

Moody romantic palette defined in `src/styles/main.css`:

- Background: `#1a1625` (deep purple-black)
- Text: `#e8d5d0` (warm cream)
- Accents: `#8b5a7c` (mauve), `#d4738f` (rose)
- Links: `#c97a9e` (soft pink)

### Categories

Default: `text`, `image`, `video`, `audio`, `mixed`, `link`, `code`, `other`

Edit in:
- `api/models/Entry.js` (schema enum)
- `src/pages/MainPage.jsx` (filter buttons)
- `src/pages/AdminEdit.jsx` (select options)

## 🔐 Security

### Password Hashing

Generate bcrypt hash for production:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 10));"
```

### JWT Authentication

- Tokens expire after 24 hours
- Stored in localStorage
- Sent via Authorization header
- Validated on all write operations

## 🛠️ Tech Stack

**Frontend**: React, React Router, Axios, Marked, Vite
**Backend**: Express (Vercel Functions), Mongoose, JWT, bcryptjs, Multer, Cloudinary
**Database**: MongoDB Atlas
**Storage**: Cloudinary
**Hosting**: Vercel
**Domain**: dylanseals.org via Namecheap

## 🐛 Troubleshooting

**Unauthorized errors**: Check JWT_SECRET, verify token in localStorage
**Upload failures**: Verify Cloudinary credentials, check file size/type
**MongoDB errors**: Check connection string, IP whitelist (0.0.0.0/0 for Vercel)
**Build failures**: Check dependencies, ensure package-lock.json is committed

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed troubleshooting.

## 📚 Additional Documentation

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Complete deployment guide
- [.env.example](./.env.example) - Environment variables template

## 📄 License

ISC

---

**Status**: Production-ready MERN stack  
**Last Updated**: January 19, 2026  
**Live**: https://dylanseals.org  
**Your personal corner of the internet** ✨

## setup

1. install dependencies:
```bash
npm install
```

2. create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. edit `.env` and set your admin password:
```
ADMIN_PASSWORD=your_secure_password_here
```

4. start the server:
```bash
node server.js
```

5. visit `http://localhost:3000`

## admin access

- login at `http://localhost:3000/admin/login`
- default password is in your `.env` file
- create, edit, and delete entries
- upload media files (images, videos, audio)

## features

- **main page**: timeline view with search and category filters
- **entry pages**: individual pages for each entry with media support
- **markdown support**: write entries in markdown or html
- **media uploads**: supports images, videos, audio files
- **search**: real-time search through titles and content
- **category filtering**: filter entries by type (text, image, video, etc.)
- **year navigation**: jump to different years in timeline

## tech stack

- node.js + express
- sqlite3 database
- vanilla html/css/javascript
- markdown rendering

## directory structure

```
dsdorg/
├── server.js          # express server
├── database.js        # database setup and queries
├── data/             # sqlite database
├── uploads/          # uploaded media files
├── public/           # static assets
│   ├── css/         # stylesheets
│   └── js/          # client-side scripts
└── views/           # html templates
```

## color scheme

moody romantic purple-pink palette:
- background: deep purple-black (#1a1625)
- text: warm cream (#e8d5d0)
- accents: mauve, rose, dusty pink
- links: soft pink (#c97a9e)

## notes

- intentionally unpolished aesthetic
- early internet vibes
- no frameworks, keep it raw
- human feel, not polished corporate

---

last updated: jan 2026