import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { marked } from 'marked';

function EntryPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEntry();
  }, [slug]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/entries?slug=${slug}`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading entry:', error);
      setError('Entry not found');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${month} ${day}, ${year} ${hours}:${minutes}${ampm}`;
  };

  const renderContent = (content, contentType) => {
    if (contentType === 'html') {
      return { __html: content };
    }
    return { __html: marked(content || '') };
  };

  if (loading) {
    return (
      <div className="entry-container">
        <div className="loading-state">loading entry...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="entry-container">
        <div className="error-state">
          <p>{error || 'Entry not found'}</p>
          <p><Link to="/">← back to main</Link></p>
        </div>
      </div>
    );
  }

  const { entry, prev, next } = data;

  return (
    <div className="entry-container">
      <nav className="entry-nav">
        <Link to="/" className="back-link">← back to main</Link>
        <div className="nav-links" style={{ display: (prev || next) ? 'flex' : 'none' }}>
          {prev && (
            <Link to={`/entry/${prev.slug}`} className="nav-prev" title={prev.title}>
              ← previous
            </Link>
          )}
          {next && (
            <Link to={`/entry/${next.slug}`} className="nav-next" title={next.title}>
              next →
            </Link>
          )}
        </div>
      </nav>

      <article className="entry-content">
        <div className="entry-header">
          <h1 className="entry-title">{entry.title}</h1>
          <div className="entry-metadata">
            <span className="entry-date">{formatDate(entry.createdAt)}</span>
            <span className="entry-category-tag">{entry.category}</span>
          </div>
        </div>

        {entry.content && (
          <div
            className="entry-body"
            dangerouslySetInnerHTML={renderContent(entry.content, entry.contentType)}
          />
        )}

        {entry.media && entry.media.length > 0 && (
          <div className="entry-media">
            {entry.media.map((item, index) => (
              <div key={index} className="media-item">
                {item.fileType === 'image' && (
                  <img src={item.filePath} alt={item.caption || 'Image'} />
                )}
                {item.fileType === 'video' && (
                  <video controls>
                    <source src={item.filePath} />
                  </video>
                )}
                {item.fileType === 'audio' && (
                  <audio controls>
                    <source src={item.filePath} />
                  </audio>
                )}
                {item.caption && (
                  <div className="media-caption">{item.caption}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </article>

      <nav className="entry-nav bottom-nav" style={{ display: (prev || next) ? 'flex' : 'none' }}>
        {prev && (
          <Link to={`/entry/${prev.slug}`} className="nav-prev" title={prev.title}>
            ← previous
          </Link>
        )}
        <Link to="/" className="back-link">back to main</Link>
        {next && (
          <Link to={`/entry/${next.slug}`} className="nav-next" title={next.title}>
            next →
          </Link>
        )}
      </nav>

      <footer className="entry-footer">
        <Link to="/admin" className="admin-link">admin</Link>
      </footer>
    </div>
  );
}

export default EntryPage;
