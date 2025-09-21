import React, { useState, useEffect } from 'react';
import { cvsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CVViewerModal from '../components/CVViewerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import notify from '../utils/notify';

const MyCVs = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvUrl, setCvUrl] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingNameId, setEditingNameId] = useState(null);
  const [nameDraft, setNameDraft] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setLoading(true);
      const response = await cvsAPI.getCVs();
      setCvs(response.data.cvs);
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      notify.error('Chỉ chấp nhận file PDF');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      notify.error('File không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      await cvsAPI.uploadCV(formData);
      fetchCVs();
      e.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading CV:', error);
      notify.error(error, 'Lỗi khi tải lên CV');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (cvId) => {
    try {
      await cvsAPI.toggleCV(cvId);
      fetchCVs();
    } catch (error) {
      console.error('Error toggling CV:', error);
      notify.error('Lỗi khi thay đổi trạng thái CV');
    }
  };

  const handleDeleteCV = async (cvId) => {
    setConfirmDeleteId(cvId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await cvsAPI.deleteCV(confirmDeleteId);
      fetchCVs();
    } catch (error) {
      console.error('Error deleting CV:', error);
      notify.error('Lỗi khi xóa CV');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const startEditName = (cv) => {
    setEditingNameId(cv.id);
    setNameDraft(cv.name || '');
  };

  const cancelEditName = () => {
    setEditingNameId(null);
    setNameDraft('');
  };

  const saveName = async (cvId) => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      notify.error('Tên CV không được để trống');
      return;
    }
    if (trimmed.length > 150) {
      notify.error('Tên CV quá dài (tối đa 150 ký tự)');
      return;
    }
    try {
      await cvsAPI.renameCV(cvId, trimmed);
      await fetchCVs();
      setEditingNameId(null);
      setNameDraft('');
      notify.success('Đã đổi tên CV');
    } catch (error) {
      console.error('Error renaming CV:', error);
      notify.error('Lỗi khi đổi tên CV');
    }
  };

  const handleViewCV = async (cvId) => {
    try {
      const response = await cvsAPI.getCVFile(cvId);
      // Tạo Blob với đúng MIME type PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setCvUrl(url);   // truyền cho Modal
      setShowCVModal(true);
    } catch (error) {
      console.error('Error viewing CV:', error);
      notify.error('Không thể xem CV');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Redirect companies to applications page
  if (user.account_type === 'company') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-blue-800 mb-4">
            Quản lý CV
          </h1>
          <p className="text-blue-700 mb-6">
            Doanh nghiệp không thể quản lý CV cá nhân. Bạn có thể xem và quản lý CV mà ứng viên đã nộp vào bài đăng của mình.
          </p>
          <a
            href="/applications"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 inline-block"
          >
            Xem CV nhận được
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý CV
          </h1>

          {/* Upload button */}
          <label className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 cursor-pointer">
            {uploading ? 'Đang tải lên...' : 'Tải lên CV'}
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <p className="text-gray-600 text-sm">
          Tải lên CV của bạn để có thể đính kèm vào bài đăng tìm việc hoặc nộp ứng tuyển.
          Chỉ chấp nhận file PDF, dung lượng tối đa 5MB.
        </p>
      </div>

      {/* CVs List */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có CV nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tải lên CV đầu tiên của bạn để bắt đầu tìm việc.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {cvs.map((cv) => (
              <div key={cv.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        {editingNameId === cv.id ? (
                          <>
                            <input
                              type="text"
                              value={nameDraft}
                              onChange={(e) => setNameDraft(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveName(cv.id); if (e.key === 'Escape') cancelEditName(); }}
                              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                              placeholder="Nhập tên CV"
                              autoFocus
                            />
                            <button
                              onClick={() => saveName(cv.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded-md text-xs hover:bg-green-700"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={cancelEditName}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs hover:bg-gray-300"
                            >
                              Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <span>{cv.name || `CV #${cv.id}`}</span>
                            <button
                              onClick={() => startEditName(cv)}
                              className="text-sm text-primary-600 hover:text-primary-700 underline"
                            >
                              Sửa tên
                            </button>
                          </>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Tải lên: {formatDate(cv.created_at)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cv.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {cv.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewCV(cv.id)}
                      className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-700"
                    >
                      Xem
                    </button>

                    <button
                      onClick={() => handleToggleActive(cv.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${cv.is_active
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      {cv.is_active ? 'Tạm dừng' : 'Kích hoạt'}
                    </button>

                    <button
                      onClick={() => handleDeleteCV(cv.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
        title="Xóa CV"
        message="Bạn có chắc chắn muốn xóa CV này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default MyCVs;
