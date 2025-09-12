import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SearchUsers from './pages/SearchUsers';
import UserProfile from './pages/UserProfile';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import MyCVs from './pages/MyCVs';
import Applications from './pages/Applications';
import CreateCV from './pages/CreateCV';
import AdminCompanies from './pages/AdminCompanies';
import CompanyRegister from './pages/CompanyRegister';

import FloatingChatbotButton from './components/FloatingChatbotButton';


// Component to handle routing based on auth status
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing page for non-authenticated users */}
      <Route path="/" element={
        isAuthenticated ? (
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        ) : (
          <LandingPage />
        )
      } />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/company" element={<CompanyRegister />} />

      {/* Protected routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Layout>
            <Home />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/search-users" element={
        <ProtectedRoute>
          <Layout>
            <SearchUsers />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/users/:userId" element={
        <ProtectedRoute>
          <Layout>
            <UserProfile />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/create-post" element={
        <ProtectedRoute>
          <Layout>
            <CreatePost />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />


      <Route path="/my-cvs" element={
        <ProtectedRoute>
          <Layout>
            <MyCVs />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/create-cv" element={
        <ProtectedRoute>
          <Layout>
            <CreateCV />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/applications" element={
        <ProtectedRoute>
          <Layout>
            <Applications />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/companies" element={
        <ProtectedRoute>
          <Layout>
            <AdminCompanies />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <FloatingChatbotButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
