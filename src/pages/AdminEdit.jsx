import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { uploadFiles } from '../utils/api';

function AdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    category: 'text',
    contentType: 'markdown',
    content: ''
  });
  
  const [files, setFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (isEditMode) {
      loadEntry();
    }

    // Listen for upload progress events
    const handleProgress = (e) => {
      setUploadProgress(e.detail.percent);
    };
    window.addEventListener('upload-progress', handleProgress);
    
    return () => {
      window.removeEventListener('upload-progress', handleProgress);
    };
  }, [id, navigate, isEditMode]);

  const loadEntry = async () => {
    try {
      const response = await api.get('/entries');
      const entry = response.data.find(e => e._id === id);
      if (entry) {
        setFormData({
          title: entry.title,
          category: entry.category,
          contentType: entry.contentType,
          content: entry.content || ''
        });
        setExistingMedia(entry.media || []);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      setMessage({ text: 'error loading entry', type: 'error' });
    }
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          preview: event.target.result,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setMessage({ text: 'title is required', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let entryId = id;
      
      // First, create or update the entry text content
      if (isEditMode) {
        const response = await api.put(`/entries?id=${id}`, formData);
        entryId = response.data.entry._id;
      } else {
        const response = await api.post('/entries', formData);
        entryId = response.data.entry._id;
      }
      
      // Then, if there are files to upload, send them
      if (selectedFiles.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append('entryId', entryId);
        selectedFiles.forEach(file => {
          uploadFormData.append('media', file);
        });
        
        setUploadProgress(0);
        await uploadFiles(uploadFormData);
      }
      
      setMessage({ text: 'entry saved successfully!', type: 'success' });
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      console.error('Error saving entry:', error);
      const errorMessage = error.response?.data?.error || 'error saving entry';
      setMessage({ text: errorMessage, type: 'error' });
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`delete "${formData.title}"?\n\nthis cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/entries?id=${id}`);
      setMessage({ text: 'entry deleted', type: 'success' });
      setTimeout(() => navigate('/admin'), 800);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setMessage({ text: 'error deleting entry', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>{isEditMode ? 'edit entry' : 'new entry'}</h1>
        <div className="admin-actions">
          <Link to="/admin" className="btn">← back to dashboard</Link>
          <Link to="/" className="btn">view site</Link>
        </div>
      </header>

      <main className="admin-main">
        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-group">
            <label htmlFor="title">title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={loading}
              placeholder="enter entry title..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                disabled={loading}
              >
                <option value="text">text</option>
                <option value="image">image</option>
                <option value="video">video</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="content-type">content type</label>
              <select
                id="content-type"
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                disabled={loading}
              >
                <option value="markdown">markdown</option>
                <option value="html">html</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">content</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows="15"
              placeholder="write your content here..."
              disabled={loading}
            />
            <div className="help-text">
              supports markdown: # headers, **bold**, *italic*, [links](url), `code`, etc.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="media-upload">media files</label>
            <input
              type="file"
              id="media-upload"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileSelect}
              disabled={loading}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => document.getElementById('media-upload').click()}
              disabled={loading}
            >
              + add media files
            </button>
            <div className="help-text">
              supports images, videos, and audio files (max 10 files, 50MB each)
            </div>
          </div>

          {/* Existing Media Display */}
          {existingMedia.length > 0 && (
            <div className="existing-media">
              <h3>existing media ({existingMedia.length})</h3>
              <div className="media-grid">
                {existingMedia.map((media, index) => (
                  <div key={index} className="media-item">
                    {media.fileType === 'image' && (
                      <img src={media.filePath} alt={media.caption || 'media'} />
                    )}
                    {media.fileType === 'video' && (
                      <video src={media.filePath} controls />
                    )}
                    {media.fileType === 'audio' && (
                      <audio src={media.filePath} controls />
                    )}
                    {media.caption && (
                      <div className="media-caption">{media.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Files Preview */}
          {files.length > 0 && (
            <div className="file-preview">
              <h3>files to upload ({files.length})</h3>
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    {file.type.startsWith('image/') && (
                      <div className="file-thumbnail">
                        <img src={file.preview} alt={file.name} />
                      </div>
                    )}
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => removeFile(index)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <div className="progress-text">uploading... {uploadProgress}%</div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading 
                ? uploadProgress > 0 ? 'uploading...' : 'saving...'
                : isEditMode ? 'update entry' : 'create entry'
              }
            </button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => navigate('/admin')}
              disabled={loading}
            >
              cancel
            </button>
            {isEditMode && (
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={loading}
              >
                delete entry
              </button>
            )}
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`form-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

export default AdminEdit;
