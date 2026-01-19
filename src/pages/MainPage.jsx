import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function MainPage() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchTerm, currentFilter, entries]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/entries');
      setEntries(response.data);
      setFilteredEntries(response.data);
    } catch (error) {
      console.error('Error loading entries:', error);
      setError('Failed to load entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.content && entry.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(entry => entry.category === currentFilter);
    }

    setFilteredEntries(filtered);
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

  const groupByYear = (entries) => {
    const groups = {};
    entries.forEach(entry => {
      const year = new Date(entry.createdAt).getFullYear();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(entry);
    });
    return groups;
  };

  const entriesByYear = groupByYear(filteredEntries);
  const years = Object.keys(entriesByYear).sort((a, b) => b - a);

  return (
    <div className="container">
      <header className="main-header">
        <div className="site-meta">
          <span className="last-updated">last updated: {entries.length > 0 ? formatDate(entries[0].createdAt) : 'never'}</span>
        </div>
        <div className="site-stats">
          <span className="entry-count">{entries.length} total</span>
        </div>
      </header>

      <div className="search-section">
        <input
          type="text"
          className="search-box"
          placeholder="search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-section">
        <div className="filter-label">filter by:</div>
        <div className="category-filters">
          {['all', 'text', 'image', 'video'].map(cat => (
            <button
              key={cat}
              className={`filter-btn ${currentFilter === cat ? 'active' : ''}`}
              onClick={() => setCurrentFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {years.length > 1 && (
        <div className="year-jumps visible">
          jump to year: {years.map(year => (
            <a key={year} href={`#year-${year}`}>{year}</a>
          ))}
        </div>
      )}

      <main className="timeline-section">
        {loading ? (
          <div className="loading-state">loading entries...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : filteredEntries.length === 0 ? (
          <div className="no-results"></div>
        ) : (
          years.map(year => (
            <div key={year} className="year-group" id={`year-${year}`}>
              <h2 className="year-header">{year}</h2>
              <div className="entries-list">
                {entriesByYear[year].map((entry) => (
                  <Link
                    key={entry._id}
                    to={`/entry/${entry.slug}`}
                    className="entry-card"
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <div className="entry-header">
                      <h3 className="entry-title">{entry.title}</h3>
                      <div className="entry-meta">
                        <span className="entry-date">{formatDate(entry.createdAt)}</span>
                        <span className="entry-category">{entry.category}</span>
                      </div>
                    </div>
                    {entry.content && (
                      <div className="entry-preview">
                        {entry.content.substring(0, 120)}...
                      </div>
                    )}
                    {entry.thumbnailPath && (
                      <img src={entry.thumbnailPath} className="entry-thumbnail" alt="thumbnail" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <Link to="/admin" className="admin-link">admin</Link>
          <span className="divider">·</span>
          <span className="copyright">© 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;
