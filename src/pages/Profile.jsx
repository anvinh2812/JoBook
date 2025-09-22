import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, postsAPI, followsAPI, cvsAPI, applicationsAPI, companiesAPI } from '../services/api';
import FollowModal from '../components/FollowModal';
import EditPostModal from '../components/EditPostModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PostCard from '../components/PostCard';
import ApplyModal from '../components/ApplyModal';
import CVViewerModal from '../components/CVViewerModal';
import notify from '../utils/notify';
import { getAvatarUrl } from "../config"; 

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    address: user?.address || '',
  });
  const [userPosts, setUserPosts] = useState([]);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [postFilter, setPostFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvUrl, setCvUrl] = useState('');
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (user) {
      // Admin accounts should not have a personal profile page
      if (user.account_type === 'admin') {
        window.location.href = '/admin/companies';
        return;
      }
      fetchUserPosts();
      fetchFollowCounts();
      if (user.account_type === 'company' && user.company_id) {
        companiesAPI.getById(user.company_id)
          .then(res => setCompany(res.data.company))
          .catch(() => setCompany(null));
      } else {
        setCompany(null);
      }
    }
  }, [user, postFilter]);

  const fetchUserPosts = async () => {
    try {
      const params = postFilter !== 'all' ? { type: postFilter } : {};
      const response = await postsAPI.getUserPosts(user.id, params);
      setUserPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchFollowCounts = async () => {
    try {
      const response = await followsAPI.getFollowCounts(user.id);
      setFollowCounts(response.data);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await usersAPI.updateProfile(formData);
      updateUser(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      notify.error('Lỗi khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await usersAPI.uploadAvatar(formData);
      updateUser({ ...user, avatar_url: response.data.avatar_url });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      notify.error('Lỗi khi tải lên ảnh đại diện');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSavePost = async (postId, postData) => {
    try {
      await postsAPI.updatePost(postId, postData);
      fetchUserPosts(); // Refresh posts
      notify.success('Cập nhật bài đăng thành công!');
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    setConfirmDeleteId(postId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await postsAPI.deletePost(confirmDeleteId);
      fetchUserPosts();
      notify.success('Xóa bài đăng thành công!');
    } catch (error) {
      console.error('Error deleting post:', error);
      notify.error('Lỗi khi xóa bài đăng');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Apply/View CV handlers
  const handleApply = (post) => {
    setSelectedPost(post);
    setShowApplyModal(true);
  };

  const handleViewCV = async (cvId) => {
    try {
      const response = await cvsAPI.getCVFile(cvId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCvUrl(url);
      setShowCVModal(true);
    } catch (error) {
      console.error('Error viewing CV:', error);
      notify.error('Không thể xem CV');
    }
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      await applicationsAPI.apply(applicationData);
      setShowApplyModal(false);
      notify.success('Nộp CV thành công!');
    } catch (error) {
      console.error('Error applying:', error);
      notify.error(error, 'Lỗi khi nộp CV');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative">
            {user?.avatar_url ? (
  <img
    src={getAvatarUrl(user.avatar_url)}
    alt={user.full_name}
    className="h-24 w-24 rounded-full object-cover"
  />
) : (
  <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
    <span className="text-2xl font-medium text-gray-700">
      {user?.full_name?.charAt(0).toUpperCase()}
    </span>
  </div>
)}
            <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full cursor-pointer hover:bg-primary-700">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-primary-500 outline-none bg-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Địa chỉ của bạn"
                  />
                </div>
                <div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Giới thiệu về bạn..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Chỉnh sửa
                  </button>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {user?.account_type === 'candidate' ? 'Ứng viên' : 'Doanh nghiệp'}
                  </span>
                  <span className="text-gray-600">{user?.email}</span>
                </div>
                <div className="mt-2 text-gray-700">
                  <div><span className="font-medium">Địa chỉ:</span> {user?.address || 'Chưa cập nhật'}</div>
                  {user?.account_type === 'company' && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-medium">Thuộc công ty:</span>
                      {company ? (
                        <div className="flex items-center gap-2">
                          {company.logo_url && (
                            <img src={company.logo_url} alt={company.name} className="w-5 h-5 object-cover rounded" />
                          )}
                          <span>{company.name}</span>
                          {/* Intentionally hide MST (tax_code) from display */}
                          {company.address && (
                            <span className="text-gray-500 text-sm ml-3">Địa chỉ: {company.address}</span>
                          )}
                        </div>
                      ) : (
                        <span>Không xác định</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mt-3">{user?.bio || 'Chưa có giới thiệu'}</p>

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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Bài đăng của tôi</h2>

          {/* Filter buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setPostFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${postFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Tất cả
            </button>
            {user?.account_type === 'candidate' && (
              <button
                onClick={() => setPostFilter('find_job')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${postFilter === 'find_job'
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
                className={`px-3 py-1 rounded-md text-sm font-medium ${postFilter === 'find_candidate'
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
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onApply={handleApply}
                onViewCV={handleViewCV}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            ))
          )}
        </div>
      </div>

      {/* Follow Modal */}
      {showFollowModal && (
        <FollowModal
          userId={user.id}
          type={followModalType}
          onClose={() => setShowFollowModal(false)}
        />
      )}

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => {
            setShowEditModal(false);
            setEditingPost(null);
          }}
          onSave={handleSavePost}
        />
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          post={selectedPost}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}

      {/* CV Viewer Modal */}
      {showCVModal && (
        <CVViewerModal
          cvUrl={cvUrl}
          onClose={() => {
            setShowCVModal(false);
            setCvUrl('');
          }}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Xóa bài đăng"
        message="Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Profile;
