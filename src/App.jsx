import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './api';
import Layout from './components/Layout';
import Home from './pages/Home';
import SinfPage from './pages/SinfPage';
import PoetsPage from './pages/PoetsPage';
import PoetProfile from './pages/PoetProfile';
import PoetryView from './pages/PoetryView';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Auth from './pages/Auth';
import VerifyOtp from './pages/VerifyOtp';
import Dashboard from './pages/Dashboard';
import SubmissionForm from './pages/SubmissionForm';
import Onboarding from './pages/Onboarding';
import './App.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireProfile = true }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await api.auth.getUser();
      setUser(userData);

      if (userData && requireProfile) {
        try {
          const poets = await api.get('/poets');
          const profile = poets.find(p => p.userId === userData.id);
          setHasProfile(!!profile);
        } catch {
          setHasProfile(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [requireProfile]);

  if (loading) return <div className="loading">LOADING...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireProfile && !hasProfile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sinf/:slug" element={<SinfPage />} />
          <Route path="/poets" element={<PoetsPage />} />
          <Route path="/poet/:slug" element={<PoetProfile />} />
          <Route path="/poetry/:id" element={<PoetryView />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireProfile={false}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireProfile={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmissionForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
