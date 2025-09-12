import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerPresetType, setRegisterPresetType] = useState('candidate');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-xl mr-3 shadow">
                <span className="font-bold text-xl">J</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">jobook</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => { setRegisterPresetType('candidate'); setShowRegisterModal(true); }}
                className="px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow"
              >
                Đăng ký
              </button>
              <Link
                to="/register/company"
                className="px-4 py-2 rounded-lg font-medium border border-blue-600 text-blue-700 hover:bg-blue-50"
              >
                Đăng ký công ty
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative overflow-hidden">
        {/* Decorative shapes */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-12 left-1/4 h-40 w-40 rounded-full bg-blue-200/40 blur-2xl animate-pulse"></div>
          <div className="absolute top-24 right-1/4 h-24 w-24 rounded-full bg-blue-300/40 blur-xl animate-bounce"></div>
          <div className="absolute bottom-24 left-1/3 h-32 w-32 rounded-full bg-indigo-200/40 blur-xl animate-pulse"></div>
          <div className="absolute top-1/2 right-1/3 h-16 w-16 rounded-full bg-blue-400/30 blur animate-bounce"></div>
        </div>

        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Brand emblem */}
            <div className="flex justify-center mb-8">
              <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-2xl border-2 border-blue-700">
                <span className="font-bold text-6xl">J</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">jobook</span>
            </h1>
            <div className="flex justify-center gap-3 mb-8">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
              <div className="h-1 w-8 bg-blue-300 rounded-full"></div>
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
            </div>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Nền tảng tuyển dụng thông minh giúp bạn kết nối nhanh với cơ hội phù hợp.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => { setRegisterPresetType('candidate'); setShowRegisterModal(true); }}
                className="bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-blue-700 shadow transition flex items-center group"
              >
                Đăng ký ngay
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <Link
                to="/register/company"
                className="px-8 py-4 text-lg font-semibold rounded-lg border-2 border-blue-600 text-blue-700 hover:bg-blue-50 bg-white"
              >
                Đăng ký tài khoản công ty
              </Link>
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-gray-600 hover:text-blue-700 font-semibold text-lg"
              >
                Tôi đã có tài khoản
              </button>
            </div>

            {/* Search */}
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                  placeholder="Thử: Lập trình viên, Marketing Manager..."
                />
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'].map((city) => (
                  <span key={city} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { number: '1000+', label: 'Công ty tin dùng', icon: '🏢' },
              { number: '50k+', label: 'Ứng viên đang hoạt động', icon: '👥' },
              { number: '95%', label: 'Tỷ lệ thành công', icon: '🎯' },
            ].map((s) => (
              <div key={s.label} className="text-center p-8 rounded-2xl bg-white/70 backdrop-blur shadow hover:shadow-lg transition">
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="text-4xl font-bold text-blue-600 mb-1">{s.number}</div>
                <div className="text-gray-600 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="mt-24">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tại sao chọn jobook?</h2>
              <p className="text-gray-600 text-lg">Nền tảng tuyển dụng thông minh với công nghệ gợi ý hiện đại</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Gợi ý thông minh', description: 'AI phân tích hồ sơ và gợi ý công việc phù hợp nhất', icon: '🤖' },
                { title: 'Kết nối nhanh chóng', description: 'Liên hệ trực tiếp với nhà tuyển dụng trong vài phút', icon: '⚡' },
                { title: 'Bảo mật tuyệt đối', description: 'Thông tin cá nhân được bảo vệ an toàn', icon: '🔒' },
              ].map((f) => (
                <div key={f.title} className="p-6 rounded-2xl bg-white/70 backdrop-blur shadow hover:shadow-lg transition text-center">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => { setShowLoginModal(false); setRegisterPresetType('candidate'); setShowRegisterModal(true); }}
        />
      )}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          presetAccountType={registerPresetType}
          onSwitchToLogin={() => setShowLoginModal(true)}
        />
      )}
    </div>
  );
};

export default LandingPage;
