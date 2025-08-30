import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI, cvsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    post_type: '',
    attached_cv_id: '',
  });
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Set default post type based on user account type
    const defaultPostType = user.account_type === 'candidate' ? 'find_job' : 'find_candidate';
    setFormData(prev => ({ ...prev, post_type: defaultPostType }));

    // Fetch CVs if user is candidate
    if (user.account_type === 'candidate') {
      fetchCVs();
    }
  }, [user]);

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
      if (formData.post_type === 'find_job' && !formData.attached_cv_id) {
        setError('Vui lòng chọn CV để đính kèm');
        setLoading(false);
        return;
      }

      const postData = {
        ...formData,
        attached_cv_id: formData.attached_cv_id ? parseInt(formData.attached_cv_id) : null
      };

      await postsAPI.createPost(postData);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi tạo bài đăng');
    } finally {
      setLoading(false);
    }
  };

  const isJobSeeker = user.account_type === 'candidate';
  const isCompany = user.account_type === 'company';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isJobSeeker ? 'Tạo bài đăng tìm việc' : 'Tạo bài đăng tuyển dụng'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800 text-sm">
              {isJobSeeker && 'Bạn đang tạo bài đăng tìm việc làm. Hãy mô tả kỹ năng và mong muốn của mình.'}
              {isCompany && 'Bạn đang tạo bài đăng tuyển dụng. Hãy mô tả vị trí và yêu cầu công việc.'}
            </p>
          </div>

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
          {formData.post_type === 'find_job' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn CV đính kèm *
              </label>
              {cvs.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-800">
                    Bạn chưa có CV nào hoặc CV chưa được kích hoạt.
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Vui lòng tải lên CV trong phần "Quản lý CV" trước khi tạo bài đăng.
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
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || (formData.post_type === 'find_job' && cvs.length === 0)}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo...' : (isJobSeeker ? 'Đăng bài tìm việc' : 'Đăng bài tuyển dụng')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
