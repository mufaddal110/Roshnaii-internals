import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import api from './api';
import Layout from './components/Layout';
// ... other imports (unchanged for brevity)
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
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(requireProfile);
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated && user && requireProfile) {
        try {
          const poets = await api.get('/poets');
          const profile = poets.find(p => p.userId === user.id);
          setHasProfile(!!profile);
        } catch {
          setHasProfile(false);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
      }
    };
    checkProfile();
  }, [isAuthenticated, user, requireProfile]);

  if (loading || (requireProfile && profileLoading)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <p className="loading">LOADING...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireProfile && !hasProfile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

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
