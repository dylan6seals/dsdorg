// dsd.org - admin dashboard

document.addEventListener('DOMContentLoaded', () => {
  loadEntries();
});

function loadEntries() {
  fetch('/api/entries')
    .then(response => response.json())
    .then(entries => {
      displayEntries(entries);
      updateStats(entries);
    })
    .catch(error => {
      console.error('Error loading entries:', error);
      document.getElementById('entries-table').innerHTML = 
        '<div class="loading">error loading entries</div>';
    });
}

function displayEntries(entries) {
  const table = document.getElementById('entries-table');
  
  if (entries.length === 0) {
    table.innerHTML = '<div class="no-entries">no entries yet. create your first one!</div>';
    return;
  }
  
  let html = `
    <div class="entry-row entry-row-header">
      <div>title</div>
      <div>category</div>
      <div>date</div>
      <div>actions</div>
    </div>
  `;
  
  entries.forEach(entry => {
    const date = formatDate(entry.created_at);
    html += `
      <div class="entry-row">
        <div class="entry-row-title">
          <a href="/entry/${entry.slug}" target="_blank">${escapeHtml(entry.title)}</a>
        </div>
        <div class="entry-row-category">${entry.category}</div>
        <div class="entry-row-date">${date}</div>
        <div class="entry-row-actions">
          <a href="/admin/edit/${entry.id}" class="btn">edit</a>
          <button onclick="deleteEntry(${entry.id}, '${escapeHtml(entry.title)}')" class="btn btn-danger">delete</button>
        </div>
      </div>
    `;
  });
  
  table.innerHTML = html;
}

function updateStats(entries) {
  const stats = document.getElementById('entry-stats');
  const total = entries.length;
  
  // Count by category
  const categories = {};
  entries.forEach(entry => {
    categories[entry.category] = (categories[entry.category] || 0) + 1;
  });
  
  const categoryText = Object.entries(categories)
    .map(([cat, count]) => `${cat}: ${count}`)
    .join(' | ');
  
  stats.innerHTML = `${total} total | ${categoryText}`;
}

function deleteEntry(id, title) {
  if (!confirm(`delete "${title}"?\n\nthis cannot be undone.`)) {
    return;
  }
  
  fetch(`/api/entry/${id}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadEntries();
    } else {
      alert('error deleting entry');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('error deleting entry');
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
