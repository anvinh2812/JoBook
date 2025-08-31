import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, postsAPI, followsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FollowModal from '../components/FollowModal';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [postFilter, setPostFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user, postFilter]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Redirect if trying to view own profile
      if (parseInt(userId) === currentUser.id) {
        navigate('/profile');
        return;
      }

      const [userResponse, followCountsResponse, followStatusResponse] = await Promise.all([
        usersAPI.getUser(userId),
        followsAPI.getFollowCounts(userId),
        followsAPI.getFollowStatus(userId)
      ]);

      setUser(userResponse.data.user);
      setFollowCounts(followCountsResponse.data);
      setIsFollowing(followStatusResponse.data.isFollowing);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 404) {
        navigate('/search-users');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const params = postFilter !== 'all' ? { type: postFilter } : {};
      const response = await postsAPI.getUserPosts(userId, params);
      setUserPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleFollow = async () => {
    if (followLoading) return;
    
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await followsAPI.unfollow(userId);
        setIsFollowing(false);
        setFollowCounts(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await followsAPI.follow(userId);
        setIsFollowing(true);
        setFollowCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      alert('Lỗi khi thực hiện thao tác');
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAccountTypeText = (accountType) => {
    return accountType === 'candidate' ? 'Ứng viên' : 'Doanh nghiệp';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Người dùng không tồn tại</h1>
        <button
          onClick={() => navigate('/search-users')}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Quay lại tìm kiếm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-2xl font-medium text-gray-700">
                  {user.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {getAccountTypeText(user.account_type)}
                  </span>
                  <span className="text-gray-600">{user.email}</span>
                </div>
              </div>
              
              {/* Follow Button */}
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                  isFollowing
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {followLoading ? 'Đang xử lý...' : (isFollowing ? 'Bỏ theo dõi' : 'Theo dõi')}
              </button>
            </div>
            
            <p className="text-gray-700 mt-3">{user.bio || 'Chưa có giới thiệu'}</p>
            
            {/* Follow stats */}
            <div className="flex space-x-6 mt-4">
              <button
                onClick={() => {
                  setFollowModalType('followers');
                  setShowFollowModal(true);
                }}
                className="text-center hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <div className="text-xl font-bold text-gray-900">{followCounts.followers}</div>
                <div className="text-sm text-gray-600">Người theo dõi</div>
              </button>
              <button
                onClick={() => {
                  setFollowModalType('following');
                  setShowFollowModal(true);
                }}
                className="text-center hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <div className="text-xl font-bold text-gray-900">{followCounts.following}</div>
                <div className="text-sm text-gray-600">Đang theo dõi</div>
              </button>
            </div>

            {/* Member since */}
            <div className="mt-4 text-sm text-gray-500">
              Tham gia từ {formatDate(user.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Bài đăng của {user.full_name}
          </h2>
          
          {/* Filter buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setPostFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                postFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
            {user?.account_type === 'candidate' && (
              <button
                onClick={() => setPostFilter('find_job')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  postFilter === 'find_job'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tìm việc
              </button>
            )}
            {user?.account_type === 'company' && (
              <button
                onClick={() => setPostFilter('find_candidate')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  postFilter === 'find_candidate'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tuyển dụng
              </button>
            )}
          </div>
        </div>

        {/* Posts list */}
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có bài đăng nào</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        post.post_type === 'find_job'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {post.post_type === 'find_job' ? 'Tìm việc' : 'Tuyển dụng'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-700 text-sm">{post.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Follow Modal */}
      {showFollowModal && (
        <FollowModal
          userId={userId}
          type={followModalType}
          onClose={() => setShowFollowModal(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
