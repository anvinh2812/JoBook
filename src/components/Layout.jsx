import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserDropdown from './UserDropdown';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">JoBook</h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {user?.account_type === 'admin' ? (
                // Admin: only one tab for company review
                <Link
                  to="/admin/companies"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/companies')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Duyệt công ty
                </Link>
              ) : (
                // Non-admin: normal navigation
                <>
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Trang chủ
                  </Link>
                  <Link
                    to="/search-users"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/search-users')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Tìm người dùng
                  </Link>
                  {/* Hide the create-post link for candidate users */}
                  {user?.account_type !== 'candidate' && (
                    <Link
                      to="/create-post"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/create-post')
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {user?.account_type === 'candidate' ? 'Đăng bài tìm việc' : 'Đăng bài tuyển dụng'}
                    </Link>
                  )}
                  {user?.account_type === 'candidate' && (
                    <>
                      <Link
                        to="/create-cv"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/create-cv')
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Tạo CV
                      </Link>
                      <Link
                        to="/my-cvs"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/my-cvs')
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Quản lý CV
                      </Link>
                      <Link
                        to="/recommendations"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/recommendations')
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Gợi ý phù hợp
                      </Link>
                    </>
                  )}
                  <Link
                    to="/applications"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/applications')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {user?.account_type === 'candidate' ? 'CV đã nộp' : 'CV nhận được'}
                  </Link>
                </>
              )}
            </nav>

            {/* User menu */}
            <div className="flex items-center">
              <UserDropdown onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
