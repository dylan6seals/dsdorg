// dsd.org - admin entry create/edit

let isEditMode = false;
let currentEntryId = null;

document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  checkEditMode();
});

function checkEditMode() {
  const path = window.location.pathname;
  const match = path.match(/\/admin\/edit\/(\d+)/);
  
  if (match) {
    isEditMode = true;
    currentEntryId = match[1];
    document.getElementById('page-title').textContent = 'edit entry - admin - dsd.org';
    document.getElementById('page-heading').textContent = 'edit entry';
    document.getElementById('submit-btn').textContent = 'update entry';
    document.getElementById('delete-btn').style.display = 'inline-block';
    loadEntryForEdit(currentEntryId);
  }
}

function setupForm() {
  const form = document.getElementById('entry-form');
  const mediaInput = document.getElementById('media');
  const deleteBtn = document.getElementById('delete-btn');
  
  // File preview
  mediaInput.addEventListener('change', (e) => {
    showFilePreview(e.target.files);
  });
  
  // Form submission
  form.addEventListener('submit', handleSubmit);
  
  // Delete button
  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleDelete);
  }
}

function showFilePreview(files) {
  const preview = document.getElementById('file-preview');
  preview.innerHTML = '';
  
  if (files.length === 0) return;
  
  Array.from(files).forEach(file => {
    const item = document.createElement('div');
    item.className = 'file-preview-item';
    item.textContent = `${file.name} (${formatFileSize(file.size)})`;
    preview.appendChild(item);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function handleSubmit(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'saving...';
  submitBtn.disabled = true;
  
  const formData = new FormData(e.target);
  
  const url = isEditMode ? `/api/entry/${currentEntryId}` : '/api/entry';
  const method = isEditMode ? 'PUT' : 'POST';
  
  fetch(url, {
    method: method,
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showMessage('entry saved successfully!', 'success');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    } else {
      showMessage('error saving entry: ' + (data.error || 'unknown error'), 'error');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showMessage('error saving entry: ' + error.message, 'error');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

function handleDelete() {
  const title = document.getElementById('title').value;
  
  if (!confirm(`delete "${title}"?\n\nthis cannot be undone.`)) {
    return;
  }
  
  fetch(`/api/entry/${currentEntryId}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showMessage('entry deleted', 'success');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 800);
    } else {
      showMessage('error deleting entry', 'error');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showMessage('error deleting entry: ' + error.message, 'error');
  });
}

function loadEntryForEdit(id) {
  // Get entry by id
  fetch(`/api/entries`)
    .then(response => response.json())
    .then(entries => {
      const entry = entries.find(e => e.id == id);
      if (!entry) {
        // Try getting it by slug
        return fetch(`/api/entry/${id}`).then(r => r.json());
      }
      return { entry };
    })
    .then(data => {
      const entry = data.entry || data;
      if (entry) {
        populateForm(entry);
      } else {
        showMessage('entry not found', 'error');
      }
    })
    .catch(error => {
      console.error('Error loading entry:', error);
      showMessage('error loading entry', 'error');
    });
}

function populateForm(entry) {
  document.getElementById('title').value = entry.title || '';
  document.getElementById('category').value = entry.category || 'text';
  document.getElementById('content-type').value = entry.content_type || 'markdown';
  document.getElementById('content').value = entry.content || '';
}

function showMessage(text, type) {
  const message = document.getElementById('form-message');
  message.textContent = text;
  message.className = `form-message ${type}`;
  
  setTimeout(() => {
    message.className = 'form-message';
  }, 5000);
}
