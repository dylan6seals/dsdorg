# QUICK START GUIDE

## getting started

the server is already running! 

visit: **http://localhost:3000**

---

## admin access

1. go to: **http://localhost:3000/admin/login**
2. password: `changeme123` (change this in `.env` file)

---

## creating your first entry

1. login to admin
2. click "new entry"
3. fill in:
   - **title**: name your entry
   - **category**: text, image, video, audio, mixed, link, code, or other
   - **content**: write in markdown or html
   - **media files**: optional - upload images, videos, or audio

4. click "create entry"

---

## markdown basics

```
# Big header
## Medium header
### Small header

**bold text**
*italic text*

[link text](https://url.com)

- bullet point
- another point

> quote

code in `backticks`
```

---

## sample data

want to see how it looks with content?

run: `node add-samples.js`

this will add 3 sample entries to your database.

---

## current status

✅ server running on port 3000
✅ database initialized
✅ all features working
✅ ready to use!

---

## features available

- create/edit/delete entries
- upload media files
- search functionality
- category filtering
- timeline view by year
- prev/next navigation
- markdown rendering
- admin authentication

---

## customization

change admin password in `.env`:
```
ADMIN_PASSWORD=your_new_password_here
```

restart server after changing `.env`:
```
Ctrl+C (to stop)
node server.js (to start again)
```

---

## file structure

```
uploads/
├── entry-1/      # media for entry 1
├── entry-2/      # media for entry 2
└── temp/         # temporary upload folder

data/
└── dsdorg.db     # your database
```

---

## tips

- **markdown mode**: easy formatting, great for text entries
- **html mode**: full control, can embed anything
- **mixed category**: use when entry has multiple media types
- **thumbnails**: first uploaded image becomes thumbnail
- **search**: searches both titles and content
- **year jumps**: automatically created when you have entries from multiple years

---

## what's next?

start creating entries! document your life, thoughts, projects, whatever you want.

this is your space. make it yours.

---

*everything is working perfectly - the full website is ready to use!*
