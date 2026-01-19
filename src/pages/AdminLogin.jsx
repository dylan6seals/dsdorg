import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Don't use api utility here since we don't have a token yet
      const response = await axios.post('/api/auth', { password });
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Incorrect password');
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '2px solid #4a3550' }}>
      <h1>admin login</h1>
      {error && <p className="error" style={{ color: '#d4738f', margin: '10px 0' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          required
          autoFocus
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            background: '#2d1b3d',
            border: '1px solid #4a3550',
            color: '#e8d5d0',
            fontFamily: "'Courier New', monospace"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#8b5a7c',
            border: 'none',
            color: '#e8d5d0',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Courier New', monospace",
            fontSize: '16px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'checking...' : 'enter'}
        </button>
        <Link 
          to="/" 
          style={{ 
            display: 'block', 
            textAlign: 'center', 
            marginTop: '20px', 
            color: '#c97a9e',
            textDecoration: 'none'
          }}
        >
          ← back to site
        </Link>
      </form>
    </div>
  );
}

export default AdminLogin;
