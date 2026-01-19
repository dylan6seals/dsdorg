# dsd.org

personal life portfolio website - early internet aesthetic with moody romantic vibes

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