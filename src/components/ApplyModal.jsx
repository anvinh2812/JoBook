import React, { useState, useEffect } from 'react';
import { cvsAPI } from '../services/api';
import notify from '../utils/notify';

const ApplyModal = ({ post, onClose, onSubmit }) => {
  const [cvs, setCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const response = await cvsAPI.getCVs();
      const activeCVs = response.data.cvs.filter(cv => cv.is_active);
      setCvs(activeCVs);
      if (activeCVs.length > 0) {
        setSelectedCvId(activeCVs[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCvId) {
      notify.error('Vui lòng chọn CV');
      return;
    }

    onSubmit({
      post_id: post.id,
      cv_id: parseInt(selectedCvId)
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Nộp CV ứng tuyển
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

          {/* Post info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900">{post.title}</h4>
            <p className="text-sm text-gray-600">
              Bởi: {post.author_name}
            </p>
          </div>

          {/* CV selection */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : cvs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">
                Bạn chưa có CV nào hoặc CV chưa được kích hoạt.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Vui lòng tải lên CV trong phần "Quản lý CV".
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn CV để nộp:
                </label>
                <select
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {(cv.name || `CV #${cv.id}`)} ({new Date(cv.created_at).toLocaleDateString('vi-VN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Nộp CV
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
