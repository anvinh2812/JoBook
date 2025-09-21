import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, followsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notify from '../utils/notify';

const SearchUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Account type filter: 'candidate' | 'company' | 'same_company'
  // Default is set after reading current user to avoid a brief "all" fetch
  const [accountTypeFilter, setAccountTypeFilter] = useState('');
  const [filterInitialized, setFilterInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  // Pagination (10 per page)
  const [page, setPage] = useState(1);
  const LIMIT = 10;
  const [hasMore, setHasMore] = useState(false);
  const [pageInput, setPageInput] = useState('1');
  const [total, setTotal] = useState(0);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const { user: currentUser } = useAuth();

  // Initialize default filter based on current user's role
  useEffect(() => {
    if (!filterInitialized && currentUser) {
      const defaultFilter = currentUser.account_type === 'candidate' ? 'company' : 'candidate';
      setAccountTypeFilter(defaultFilter);
      setFilterInitialized(true);
      setPage(1);
    }
  }, [currentUser, filterInitialized]);

  useEffect(() => {
    if (!filterInitialized) return;
    setPage(1);
  }, [accountTypeFilter, filterInitialized]);

  useEffect(() => {
    if (!filterInitialized) return;
    fetchUsers();
  }, [accountTypeFilter, page, filterInitialized]);

  useEffect(() => {
    if (!filterInitialized) return;
    const delayedSearch = setTimeout(() => {
      // When search changes, reset to first page; if already on page 1, fetch now
      if (page === 1) {
        fetchUsers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filterInitialized]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      } // else no 'search' param -> fetch all

      if (accountTypeFilter === 'candidate' || accountTypeFilter === 'company') {
        params.type = accountTypeFilter;
      } else if (accountTypeFilter === 'same_company') {
        params.same_company = true;
      }
      const response = await usersAPI.searchUsers(params);
      const filteredUsers = response.data.users.filter(user => user.id !== currentUser.id && user.account_type !== 'admin');
      setUsers(filteredUsers);
      setHasMore((response.data.users || []).length === LIMIT);
      setTotal(response.data.total ?? 0);
      setPageInput(String(page));

      // Check follow status for all users
      const followStatuses = await Promise.all(
        filteredUsers.map(user =>
          followsAPI.getFollowStatus(user.id).catch(() => ({ data: { isFollowing: false } }))
        )
      );

      const following = new Set();
      followStatuses.forEach((status, index) => {
        if (status.data.isFollowing) {
          following.add(filteredUsers[index].id);
        }
      });
      setFollowingUsers(following);

    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const commitPageInput = () => {
    const raw = parseInt(pageInput, 10);
    if (Number.isNaN(raw) || raw < 1) {
      setPage(1);
      return;
    }
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));
    setPage(Math.min(raw, totalPages));
  };

  const handleFollow = async (userId) => {
    try {
      await followsAPI.follow(userId);
      setFollowingUsers(prev => new Set([...prev, userId]));
    } catch (error) {
      console.error('Error following user:', error);
      notify.error(error, 'Lỗi khi theo dõi người dùng');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await followsAPI.unfollow(userId);
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      notify.error(error, 'Lỗi khi bỏ theo dõi người dùng');
    }
  };

  const getAccountTypeText = (accountType) => {
    return accountType === 'candidate' ? 'Ứng viên' : 'Doanh nghiệp';
  };

  const getAccountTypeBadgeColor = (accountType) => {
    return accountType === 'candidate'
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Tìm kiếm người dùng
        </h1>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Tìm theo tên hoặc email..."
            />
          </div>

          {/* Account Type Filter: allow switching between Candidate and Company for all users (no "Tất cả") */}
          <select
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="candidate">Ứng viên</option>
            <option value="company">Doanh nghiệp</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy người dùng</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Thử thay đổi từ khóa tìm kiếm.' : 'Hãy thử tìm kiếm để khám phá người dùng mới.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-6">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200">
                {/* User Info */}
                <div className="flex items-center space-x-5 mb-5">
                  {(() => {
                    const isCompany = user.account_type === 'company';
                    // Always show company branding (logo/name) for company accounts
                    const showCompanyBrand = isCompany;
                    const logo = showCompanyBrand ? (user.company_logo_url || user.avatar_url) : user.avatar_url;
                    const altText = showCompanyBrand ? (user.company_name || user.full_name || 'Doanh nghiệp') : (user.full_name || 'Người dùng');
                    const placeholderChar = (showCompanyBrand ? (user.company_name || '') : (user.full_name || ''))?.charAt(0)?.toUpperCase();
                    return logo ? (
                      <img
                        src={logo}
                        alt={altText}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xl font-medium text-gray-700">{placeholderChar}</span>
                      </div>
                    );
                  })()}

                  <div className="flex-1">
                    {(() => {
                      const isCompany = user.account_type === 'company';
                      // Always show company branding (logo/name) for company accounts
                      const showCompanyBrand = isCompany;
                      return (
                        <>
                          <h3
                            className={`text-xl font-semibold mb-2 ${showCompanyBrand ? 'text-rose-600' : 'text-gray-900'}`}
                          >
                            {showCompanyBrand ? (user.company_name || '(Chưa có tên công ty)') : (user.full_name)}
                          </h3>
                          {showCompanyBrand && user.full_name && (
                            <div className="text-[15px] text-gray-700 mb-2 leading-relaxed">
                              Người đại diện: <span className="font-medium">{user.full_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${getAccountTypeBadgeColor(user.account_type)}`}>
                              {getAccountTypeText(user.account_type)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-600 text-[15px] leading-loose mb-6 line-clamp-3">
                    {user.bio}
                  </p>
                )}

                {/* Actions */}
                <div className="flex space-x-3 mt-4">
                  <Link
                    to={`/users/${user.id}`}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-700 text-center"
                  >
                    {(currentUser?.account_type === 'candidate' && user.account_type === 'company') ? 'Xem bài tuyển dụng' : 'Xem hồ sơ'}
                  </Link>

                  {followingUsers.has(user.id) ? (
                    <button
                      onClick={() => handleUnfollow(user.id)}
                      className="bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      Bỏ theo dõi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(user.id)}
                      className="bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Theo dõi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          <span>Trang {page} / {Math.max(1, Math.ceil(total / LIMIT))}</span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md text-sm font-medium ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Trang trước
          </button>
          <input
            type="number"
            min={1}
            max={Math.max(1, Math.ceil(total / LIMIT))}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitPageInput(); }}
            onBlur={commitPageInput}
            className="w-20 px-3 py-2 rounded-md bg-white border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Trang"
          />
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className={`px-4 py-2 rounded-md text-sm font-medium ${!hasMore ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;
