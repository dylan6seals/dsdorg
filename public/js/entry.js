// dsd.org - entry page functionality

document.addEventListener('DOMContentLoaded', () => {
  loadEntry();
});

function loadEntry() {
  const slug = window.location.pathname.split('/entry/')[1];
  
  if (!slug) {
    showError('Invalid entry URL');
    return;
  }
  
  fetch(`/api/entry/${slug}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Entry not found');
      }
      return response.json();
    })
    .then(data => {
      displayEntry(data);
    })
    .catch(error => {
      console.error('Error loading entry:', error);
      showError('Entry not found or could not be loaded');
    });
}

function displayEntry(data) {
  const { entry, media, prev, next } = data;
  
  // Update page title
  document.getElementById('page-title').textContent = `${entry.title} - dsd.org`;
  
  // Build entry HTML
  let html = `
    <div class="entry-header">
      <h1 class="entry-title">${escapeHtml(entry.title)}</h1>
      <div class="entry-metadata">
        <span class="entry-date">${formatDate(entry.created_at)}</span>
        <span class="entry-category-tag">${entry.category}</span>
      </div>
    </div>
  `;
  
  // Add main content
  if (entry.content) {
    const contentHtml = renderContent(entry.content, entry.content_type);
    html += `<div class="entry-body">${contentHtml}</div>`;
  }
  
  // Add media
  if (media && media.length > 0) {
    html += '<div class="entry-media">';
    media.forEach(item => {
      html += renderMedia(item);
    });
    html += '</div>';
  }
  
  document.getElementById('entry-content').innerHTML = html;
  
  // Setup navigation
  setupNavigation(prev, next);
}

function renderContent(content, contentType) {
  if (contentType === 'html') {
    return content;
  }
  
  // Default to markdown
  return markdownToHtml(content);
}

function renderMedia(mediaItem) {
  let html = '<div class="media-item">';
  
  switch (mediaItem.file_type) {
    case 'image':
      html += `<img src="${mediaItem.file_path}" alt="${escapeHtml(mediaItem.caption || 'Image')}">`;
      break;
    case 'video':
      html += `<video controls><source src="${mediaItem.file_path}"></video>`;
      break;
    case 'audio':
      html += `<audio controls><source src="${mediaItem.file_path}"></audio>`;
      break;
    default:
      html += `<a href="${mediaItem.file_path}" target="_blank">Download file</a>`;
  }
  
  if (mediaItem.caption) {
    html += `<div class="media-caption">${escapeHtml(mediaItem.caption)}</div>`;
  }
  
  html += '</div>';
  return html;
}

function setupNavigation(prev, next) {
  const navLinks = document.getElementById('nav-links');
  const bottomNav = document.getElementById('bottom-nav');
  
  if (prev || next) {
    navLinks.style.display = 'flex';
    bottomNav.style.display = 'flex';
  }
  
  if (prev) {
    setupNavLink('prev-link', prev);
    setupNavLink('prev-link-bottom', prev);
  }
  
  if (next) {
    setupNavLink('next-link', next);
    setupNavLink('next-link-bottom', next);
  }
}

function setupNavLink(elementId, entry) {
  const link = document.getElementById(elementId);
  link.href = `/entry/${entry.slug}`;
  link.style.display = 'inline-block';
  link.title = entry.title;
}

function showError(message) {
  document.getElementById('entry-content').innerHTML = `
    <div class="error-state">
      <p>${escapeHtml(message)}</p>
      <p><a href="/">← back to main</a></p>
    </div>
  `;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} ${hours}:${minutes}${ampm}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  // Code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Code blocks
  html = html.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');
  
  // Line breaks to paragraphs
  const paragraphs = html.split('\n\n');
  html = paragraphs.map(p => {
    // Don't wrap if already wrapped in a tag
    if (p.match(/^<[^>]+>/)) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
  
  return html;
}
