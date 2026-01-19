import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import EntryPage from './pages/EntryPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEdit from './pages/AdminEdit';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/entry/:slug" element={<EntryPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/new" element={<AdminEdit />} />
        <Route path="/admin/edit/:id" element={<AdminEdit />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
