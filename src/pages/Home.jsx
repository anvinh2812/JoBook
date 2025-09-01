import React, { useState, useEffect } from 'react';
import { postsAPI, cvsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import ApplyModal from '../components/ApplyModal';
import CVViewerModal from '../components/CVViewerModal';
import EditPostModal from '../components/EditPostModal';
import ConfirmDialog from '../components/ConfirmDialog';
import notify from '../utils/notify';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [cvUrl, setCvUrl] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await postsAPI.getPosts(params);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSavePost = async (postId, postData) => {
    try {
      await postsAPI.updatePost(postId, postData);
      fetchPosts(); // Refresh posts
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
      fetchPosts();
      notify.success('Xóa bài đăng thành công!');
    } catch (error) {
      console.error('Error deleting post:', error);
      notify.error('Lỗi khi xóa bài đăng');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Trang chủ
        </h1>

        {/* Filter buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('find_job')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'find_job'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Tìm việc làm
          </button>
          <button
            onClick={() => setFilter('find_candidate')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'find_candidate'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Tuyển dụng
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chưa có bài đăng nào</p>
          </div>
        ) : (
          posts.map((post) => (
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

export default Home;
