import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import NotePage from './pages/NotePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import PoemsPage from './pages/PoemsPage';
import AboutUsPage from './pages/AboutUsPage';
import SubmitPage from './pages/SubmitPage';
import SetupProfilePage from './pages/SetupProfilePage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {

      if (userProfile?.isNew || !userProfile?.display_name) {
        if (location.pathname !== '/setup-profile') {
          navigate('/setup-profile', { replace: true });
        }
      }
    }
  }, [user, userProfile, loading, location.pathname, navigate]);

  if (loading) {
    return <div className="text-center py-20 text-white">Loading Society...</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/poems" element={<PoemsPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/note/:id" element={<NotePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/poets" element={<UsersPage />} />

        {/* Protected Routes */}
        <Route path="/submit" element={<ProtectedRoute><SubmitPage /></ProtectedRoute>} />
        <Route path="/setup-profile" element={<ProtectedRoute><SetupProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="bg-black min-h-screen font-serif text-gray-200 flex flex-col">
          <Navbar />
          <main className="flex-grow"><AppContent /></main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
