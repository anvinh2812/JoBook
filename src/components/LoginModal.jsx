import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginModal = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const translateLoginError = (msg = '') => {
    const m = (msg || '').toLowerCase();
    if (m.includes('invalid credentials') || m.includes('incorrect') || m.includes('invalid email') || m.includes('password')) {
      return 'Email hoặc mật khẩu không đúng';
    }
    if (m.includes('user not found')) return 'Không tìm thấy tài khoản';
    if (m.includes('disabled') || m.includes('locked')) return 'Tài khoản đã bị khóa';
    if (m.includes('too many') || m.includes('rate limit')) return 'Bạn đã thử quá nhiều lần, vui lòng thử lại sau';
    if (m.includes('network')) return 'Lỗi mạng, vui lòng thử lại';
    return 'Đăng nhập thất bại, vui lòng kiểm tra thông tin và thử lại';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      onClose();
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (savedUser?.account_type === 'admin') {
        navigate('/admin/companies');
      } else {
        navigate('/');
      }
    } else {
      setError(translateLoginError(result.message));
    }

    setLoading(false);
  };

  const handleDemoLogin = async (email) => {
    setLoading(true);
    // Use the demo password "demo123" for all demo accounts
    const result = await login(email, 'demo123');

    if (result.success) {
      onClose();
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (savedUser?.account_type === 'admin') {
        navigate('/admin/companies');
      } else {
        navigate('/');
      }
    } else {
      setError('Tài khoản demo không khả dụng');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h2>
          <p className="text-gray-600">Đăng nhập vào tài khoản jobook của bạn</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <span className="text-gray-600">Chưa có tài khoản? </span>
          <button
            onClick={() => {
              onClose();
              onSwitchToRegister?.();
            }}
            className="text-blue-600 font-semibold hover:text-blue-500"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
