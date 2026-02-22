import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Poetry from './pages/Poetry';
import Feedback from './pages/Feedback';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#e8dfc8',
            color: '#050505',
            border: '1px solid rgba(0,0,0,0.1)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/poetry" element={<Poetry />} />
        <Route path="/admin/feedback" element={<Feedback />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
