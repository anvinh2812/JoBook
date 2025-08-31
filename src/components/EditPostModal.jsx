import React, { useState, useEffect } from 'react';
import { cvsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EditPostModal = ({ post, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    description: post?.description || '',
    attached_cv_id: post?.attached_cv_id || '',
  });
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (post?.post_type === 'find_job' && user?.account_type === 'candidate') {
      fetchCVs();
    }
  }, [post, user]);

  const fetchCVs = async () => {
    try {
      const response = await cvsAPI.getCVs();
      const activeCVs = response.data.cvs.filter(cv => cv.is_active);
      setCvs(activeCVs);
    } catch (error) {
      console.error('Error fetching CVs:', error);
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
    setError('');
    setLoading(true);

    try {
      // Validate required CV for find_job posts
      if (post.post_type === 'find_job' && !formData.attached_cv_id) {
        setError('Vui lòng chọn CV để đính kèm');
        setLoading(false);
        return;
      }

      const postData = {
        ...formData,
        attached_cv_id: formData.attached_cv_id ? parseInt(formData.attached_cv_id) : null
      };

      await onSave(post.id, postData);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi cập nhật bài đăng');
    } finally {
      setLoading(false);
    }
  };

  const isJobSeeker = user?.account_type === 'candidate';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Sửa bài đăng
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {isJobSeeker ? 'Tiêu đề công việc mong muốn *' : 'Tiêu đề vị trí tuyển dụng *'}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder={
                  isJobSeeker 
                    ? "VD: Frontend Developer tìm việc tại Hà Nội" 
                    : "VD: Tuyển Backend Developer React/Node.js"
                }
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {isJobSeeker ? 'Mô tả kỹ năng và kinh nghiệm *' : 'Mô tả công việc và yêu cầu *'}
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder={
                  isJobSeeker 
                    ? "Mô tả về kỹ năng, kinh nghiệm và mong muốn của bạn..." 
                    : "Mô tả về vị trí tuyển dụng, yêu cầu và đãi ngộ..."
                }
                required
              />
            </div>

            {/* CV Selection for job seekers */}
            {post.post_type === 'find_job' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn CV đính kèm *
                </label>
                {cvs.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800">
                      Bạn chưa có CV nào hoặc CV chưa được kích hoạt.
                    </p>
                  </div>
                ) : (
                  <select
                    name="attached_cv_id"
                    value={formData.attached_cv_id}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Chọn CV...</option>
                    {cvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        CV #{cv.id} - {new Date(cv.created_at).toLocaleDateString('vi-VN')}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Submit buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || (post.post_type === 'find_job' && cvs.length === 0)}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật bài đăng'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
