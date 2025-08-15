import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Layout/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import HomeFeed from './pages/HomeFeed';
import CreatePost from './pages/CreatePost';
import Dashboard from './pages/Dashboard';
import SearchUsers from './pages/SearchUsers';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications';
import ConnectUps from './pages/ConnectUps';
import MessageUser from './pages/MessageUser';
import AllMessages from './pages/AllMessages';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

// Public Route Component (redirect to feed if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/feed" replace />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/feed" element={
          <ProtectedRoute>
            <HomeFeed />
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <SearchUsers />
          </ProtectedRoute>
        } />
        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={<Notifications />} />


        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/feed" : "/"} replace />} />
        <Route path="/connectups" element={<ConnectUps />} />
        <Route path="/messageuser/:username" element={<MessageUser />} />
        <Route path="/allmessages" element={<AllMessages />} />

{/* <Route path="/settings" element={<Settings />} /> */}

      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <AppContent />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;