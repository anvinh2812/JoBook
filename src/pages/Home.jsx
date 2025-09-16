import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CalendarRange, Check, RotateCcw } from 'lucide-react';
import DateRangeFilter from '../components/DateRangeFilter';
import { postsAPI, cvsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import ApplyModal from '../components/ApplyModal';
import CVViewerModal from '../components/CVViewerModal';
import EditPostModal from '../components/EditPostModal';
import ConfirmDialog from '../components/ConfirmDialog';
import notify from '../utils/notify';

// Helper to format a Date to yyyy-mm-dd (for input[type=date])
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDefaultDateRange = () => {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 14);
  return { start: formatDate(past), end: formatDate(today) };
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  // Infinite scroll state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);
  // Date filter (effective values used for fetching) - default last 14 days
  const { start: defaultStart, end: defaultEnd } = useMemo(() => getDefaultDateRange(), []);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  // Pending inputs (do not trigger fetch until user clicks Apply)
  const [pendingStartDate, setPendingStartDate] = useState('');
  const [pendingEndDate, setPendingEndDate] = useState('');
  const isDateFilterActive = useMemo(() => !!startDate || !!endDate, [startDate, endDate]);
  const isPendingInvalid = useMemo(() => (
    pendingStartDate && pendingEndDate && pendingStartDate > pendingEndDate
  ), [pendingStartDate, pendingEndDate]);
  // Remove manual page input in infinite scroll mode
  const [selectedPost, setSelectedPost] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [cvUrl, setCvUrl] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // reset when filter type changes
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [filter]);

  // Keep pending inputs in sync with effective values
  useEffect(() => {
    setPendingStartDate(startDate || '');
    setPendingEndDate(endDate || '');
  }, [startDate, endDate]);

  useEffect(() => {
    // reset when date range changes via Apply
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [startDate, endDate]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, startDate, endDate]);

  const fetchPosts = async () => {
    try {
      if (isFetching) return;
      setLoading(page === 1);
      setIsFetching(true);

      const params = {
        ...(filter !== 'all' ? { type: filter } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
        page,
        limit: PAGE_SIZE,
      };
      const response = await postsAPI.getPosts(params);
      const data = response.data.posts || [];
      setPosts((prev) => (page === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Infinite scroll intersection observer
  const onIntersect = useCallback((entries) => {
    const first = entries[0];
    if (first.isIntersecting && hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [hasMore, isFetching]);

  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(onIntersect, { root: null, rootMargin: '0px', threshold: 1.0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect]);

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

  const applyDateFilter = () => {
    if (isPendingInvalid) return;
    setStartDate(pendingStartDate);
    setEndDate(pendingEndDate);
    setPage(1);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setPendingStartDate('');
    setPendingEndDate('');
    setPage(1);
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
        <div className="flex flex-wrap gap-3 items-center mb-6">
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

          {/* Date range filter */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md text-gray-700">
              <CalendarRange className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-gray-700 font-medium">Lọc theo thời gian</span>
            </div>
            <DateRangeFilter
              start={pendingStartDate}
              end={pendingEndDate}
              onChange={(s, e) => { setPendingStartDate(s); setPendingEndDate(e); }}
              onApply={applyDateFilter}
              onClear={clearDateFilter}
              invalid={isPendingInvalid}
            />
          </div>
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
              showCompanyName={true}
            />
          ))
        )}
      </div>

      {/* Infinite loader sentinel */}
      <div ref={loaderRef} className="flex items-center justify-center py-8">
        {isFetching ? (
          <span className="text-sm text-gray-500">Đang tải thêm…</span>
        ) : hasMore ? (
          <span className="text-sm text-gray-400">Cuộn để tải thêm</span>
        ) : (
          <span className="text-sm text-gray-400">Đã hết bài</span>
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
