import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI, cvsAPI, companiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EndDatePicker from '../components/EndDatePicker';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    post_type: '',
    attached_cv_id: '',
    end_at: '',
  });
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [company, setCompany] = useState(null);

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
    // Fetch company info if user is company
    if (user.account_type === 'company' && user.company_id) {
      companiesAPI.getById(user.company_id)
        .then(res => setCompany(res.data.company))
        .catch(() => setCompany(null));
    }
  }, [user]);
  // Note: Removed auto-fill of title from CV selection to avoid surprising the user.

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

  const handleSelectCV = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      attached_cv_id: value,
    }));
  };

  // Removed copy-to-title helper per request.

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

      // Validate end date for company recruitment posts
      if (formData.post_type === 'find_candidate') {
        if (!formData.end_at) {
          setError('Vui lòng chọn ngày kết thúc');
          setLoading(false);
          return;
        }
        const endDate = new Date(formData.end_at);
        const now = new Date();
        if (isNaN(endDate.getTime())) {
          setError('Thời gian không hợp lệ');
          setLoading(false);
          return;
        }
        if (endDate <= now) {
          setError('Ngày kết thúc phải sau thời điểm hiện tại');
          setLoading(false);
          return;
        }
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
        {isCompany && company && (
          <div className="flex items-center gap-3 mb-4">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-8 h-8 rounded object-cover border" />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-sm text-gray-600">{company.name?.charAt(0)}</div>
            )}
            <div className="text-gray-700">
              Đăng dưới tên: <span className="font-medium">{company.name}</span>
            </div>
          </div>
        )}

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

          {/* End date for company posts */}
          {isCompany && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian kết thúc tuyển
              </label>
              <div className="mt-2">
                <EndDatePicker
                  value={formData.end_at?.slice(0, 10) || ''}
                  onChange={(d) => setFormData((prev) => ({ ...prev, end_at: d ? `${d}T23:59:59` : '' }))}
                  onApply={() => { }}
                  onClear={() => setFormData((prev) => ({ ...prev, end_at: '' }))}
                  invalid={false}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Ngày bắt đầu được tính từ thời điểm bạn bấm đăng.</p>
            </div>
          )}

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
                <>
                  <select
                    name="attached_cv_id"
                    value={formData.attached_cv_id}
                    onChange={handleSelectCV}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Chọn CV...</option>
                    {cvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {(cv.name || `CV #${cv.id}`)} ({new Date(cv.created_at).toLocaleDateString('vi-VN')})
                      </option>
                    ))}
                  </select>
                  {/* Removed copy-to-title button */}
                </>
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
