import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function AdminDashboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await api.get('/entries');
      const data = response.data;
      setEntries(data);
      
      // Calculate category statistics
      const stats = data.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + 1;
        return acc;
      }, {});
      setCategoryStats(stats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading entries:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`delete "${title}"?\n\nthis cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/entries?id=${id}`);
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('error deleting entry');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>admin dashboard</h1>
        <div className="admin-actions">
          <Link to="/" className="btn">view site</Link>
          <Link to="/admin/new" className="btn btn-primary">new entry</Link>
          <button onClick={handleLogout} className="btn">logout</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="entries-header">
          <h2>all entries</h2>
          <div className="entry-stats">
            <span className="total-count">{entries.length} total</span>
            {Object.keys(categoryStats).length > 0 && (
              <span className="category-breakdown">
                {' | '}
                {Object.entries(categoryStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([cat, count]) => `${cat}: ${count}`)
                  .join(' | ')}
              </span>
            )}
          </div>
        </div>

        <div className="entries-table">
          {loading ? (
            <div className="loading">loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="no-entries">no entries yet. create your first one!</div>
          ) : (
            <>
              <div className="entry-row entry-row-header">
                <div>title</div>
                <div>category</div>
                <div>date</div>
                <div>actions</div>
              </div>
              {entries.map(entry => (
                <div key={entry._id} className="entry-row">
                  <div className="entry-row-title">
                    <Link to={`/entry/${entry.slug}`} target="_blank" rel="noopener noreferrer">
                      {entry.title}
                    </Link>
                  </div>
                  <div className="entry-row-category">{entry.category}</div>
                  <div className="entry-row-date">{formatDate(entry.createdAt)}</div>
                  <div className="entry-row-actions">
                    <Link to={`/admin/edit/${entry._id}`} className="btn">edit</Link>
                    <button
                      onClick={() => handleDelete(entry._id, entry.title)}
                      className="btn btn-danger"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
