// dsd.org - main page functionality

let allEntries = [];
let currentFilter = 'all';

// Load entries on page load
document.addEventListener('DOMContentLoaded', () => {
  loadEntries();
  setupEventListeners();
});

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', handleSearch);
  
  // Category filters
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.category;
      filterEntries();
    });
  });
}

function loadEntries() {
  fetch('/api/entries')
    .then(response => response.json())
    .then(entries => {
      allEntries = entries;
      updateEntryCount(entries.length);
      updateLastUpdateTime(entries);
      displayEntries(entries);
      createYearJumps(entries);
    })
    .catch(error => {
      console.error('Error loading entries:', error);
      document.getElementById('timeline').innerHTML = 
        '<div class="no-results">error loading entries</div>';
    });
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (!searchTerm) {
    filterEntries();
    return;
  }
  
  const filtered = allEntries.filter(entry => {
    return entry.title.toLowerCase().includes(searchTerm) ||
           (entry.content && entry.content.toLowerCase().includes(searchTerm));
  });
  
  displayEntries(filtered);
}

function filterEntries() {
  if (currentFilter === 'all') {
    displayEntries(allEntries);
  } else {
    const filtered = allEntries.filter(entry => 
      entry.category.toLowerCase() === currentFilter
    );
    displayEntries(filtered);
  }
}

function displayEntries(entries) {
  const timeline = document.getElementById('timeline');
  
  if (entries.length === 0) {
    timeline.innerHTML = '<div class="no-results">no entries found</div>';
    return;
  }
  
  // Group entries by year
  const entriesByYear = {};
  entries.forEach(entry => {
    const year = new Date(entry.created_at).getFullYear();
    if (!entriesByYear[year]) {
      entriesByYear[year] = [];
    }
    entriesByYear[year].push(entry);
  });
  
  // Sort years descending
  const years = Object.keys(entriesByYear).sort((a, b) => b - a);
  
  // Build HTML
  let html = '';
  years.forEach(year => {
    html += `
      <div class="year-group" id="year-${year}">
        <h2 class="year-header">${year}</h2>
        <div class="entries-list">
          ${entriesByYear[year].map(entry => createEntryCard(entry)).join('')}
        </div>
      </div>
    `;
  });
  
  timeline.innerHTML = html;
  
  // Add click handlers
  document.querySelectorAll('.entry-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `/entry/${card.dataset.slug}`;
    });
  });
}

function createEntryCard(entry) {
  const date = formatDate(entry.created_at);
  const preview = entry.content ? truncate(stripMarkdown(entry.content), 120) : '';
  const thumbnail = entry.thumbnail_path ? 
    `<img src="${entry.thumbnail_path}" class="entry-thumbnail" alt="thumbnail">` : '';
  
  return `
    <div class="entry-card" data-slug="${entry.slug}">
      <div class="entry-header">
        <h3 class="entry-title">${escapeHtml(entry.title)}</h3>
        <div class="entry-meta">
          <span class="entry-date">${date}</span>
          <span class="entry-category">${entry.category}</span>
        </div>
      </div>
      ${preview ? `<div class="entry-preview">${escapeHtml(preview)}</div>` : ''}
      ${thumbnail}
    </div>
  `;
}

function createYearJumps(entries) {
  const years = [...new Set(entries.map(e => 
    new Date(e.created_at).getFullYear()
  ))].sort((a, b) => b - a);
  
  if (years.length > 1) {
    const yearJumps = document.getElementById('year-jumps');
    yearJumps.innerHTML = 'jump to year: ' + 
      years.map(year => `<a href="#year-${year}">${year}</a>`).join(' ');
    yearJumps.classList.add('visible');
  }
}

function updateEntryCount(count) {
  document.getElementById('entry-count').textContent = count;
}

function updateLastUpdateTime(entries) {
  if (entries.length === 0) {
    document.getElementById('last-update-time').textContent = 'never';
    return;
  }
  
  const latest = entries[0].created_at;
  document.getElementById('last-update-time').textContent = formatDate(latest);
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

function stripMarkdown(text) {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/>\s/g, '')
    .replace(/\n/g, ' ');
}

function truncate(str, length) {
  if (str.length <= length) return str;
  return str.substr(0, length) + '...';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
