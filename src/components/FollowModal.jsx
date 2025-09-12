import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { followsAPI } from '../services/api';

const FollowModal = ({ userId, type, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = type === 'followers'
        ? await followsAPI.getFollowersByUser(userId)
        : await followsAPI.getFollowingByUser(userId);
      // Backend returns array directly for these endpoints; fallback to keyed response
      const data = Array.isArray(response.data) ? response.data : (response.data[type] || []);
      // Exclude admin accounts from lists
      setUsers(data.filter(u => u.account_type !== 'admin'));
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">
                {type === 'followers' ? 'Chưa có người theo dõi' : 'Chưa theo dõi ai'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <Link
                  key={user.id}
                  to={`/users/${user.id}`}
                  onClick={onClose}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeBadgeColor(user.account_type)}`}>
                      {getAccountTypeText(user.account_type)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
