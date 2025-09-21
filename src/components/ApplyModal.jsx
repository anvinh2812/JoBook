import React, { useState, useEffect, useMemo } from 'react';
import { cvsAPI } from '../services/api';
import notify from '../utils/notify';
import { UploadCloud, FileText, ArrowLeft, Loader2, X } from 'lucide-react';

const ApplyModal = ({ post, onClose, onSubmit }) => {
  const [cvs, setCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const inputId = useMemo(() => `cv-upload-input-${Math.random().toString(36).slice(2, 8)}`, []);

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

  const handleUploadAndApply = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      notify.error('Vui lòng chọn tệp CV (PDF) để tải lên');
      return;
    }
    if (uploadFile && uploadFile.type !== 'application/pdf') {
      notify.error('Chỉ hỗ trợ tệp PDF');
      return;
    }
    if (uploadFile && uploadFile.size > 5 * 1024 * 1024) {
      notify.error('Kích thước CV vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('cv', uploadFile);
      if (uploadName && uploadName.trim()) {
        formData.append('name', uploadName.trim());
      }
      const res = await cvsAPI.uploadCV(formData);
      const newCv = res?.data?.cv;
      if (!newCv?.id) {
        throw new Error('Tải lên CV thất bại');
      }
      // Apply using the newly uploaded CV id
      onSubmit({ post_id: post.id, cv_id: newCv.id });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải lên CV';
      notify.error(msg);
    } finally {
      setUploading(false);
    }
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
              aria-label="Đóng"
            >
              <X className="h-6 w-6" />
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
            <form onSubmit={handleUploadAndApply}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tải CV (PDF) để nộp
                </label>
                <input
                  id={inputId}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor={inputId} className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 transition">
                  <UploadCloud className="h-8 w-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Nhấn để chọn tệp PDF</span>
                  <span className="text-xs text-gray-500">Dung lượng tối đa 5MB</span>
                </label>
                {uploadFile ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="truncate" title={uploadFile.name}>{uploadFile.name}</span>
                    <span className="text-gray-400">• {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <button type="button" onClick={() => setUploadFile(null)} className="ml-2 text-red-600 hover:underline text-xs">Xóa</button>
                  </div>
                ) : null}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên CV (tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="VD: CV_Tran_Van_A_2025"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">CV sẽ được lưu vào "Quản lý CV" của bạn.</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                  disabled={uploading}
                >
                  <ArrowLeft className="h-4 w-4" /> Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className={`flex-1 inline-flex items-center justify-center gap-2 ${uploading ? 'bg-primary-300' : 'bg-primary-600 hover:bg-primary-700'} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  {uploading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Đang tải…</>) : (<><UploadCloud className="h-4 w-4" /> Tải lên & Nộp CV</>)}
                </button>
              </div>
            </form>
          ) : (
            <>
              {!showUpload ? (
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
                    <button
                      type="button"
                      onClick={() => setShowUpload(true)}
                      className="mt-3 inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-full"
                    >
                      <UploadCloud className="h-4 w-4" /> Tải lên CV mới
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      <UploadCloud className="h-4 w-4" /> Nộp CV
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleUploadAndApply}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tải CV (PDF) để nộp
                    </label>
                    <input
                      id={inputId}
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor={inputId} className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 transition">
                      <UploadCloud className="h-8 w-8 text-primary-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Nhấn để chọn tệp PDF</span>
                      <span className="text-xs text-gray-500">Dung lượng tối đa 5MB</span>
                    </label>
                    {uploadFile ? (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="truncate" title={uploadFile.name}>{uploadFile.name}</span>
                        <span className="text-gray-400">• {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <button type="button" onClick={() => setUploadFile(null)} className="ml-2 text-red-600 hover:underline text-xs">Xóa</button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên CV (tuỳ chọn)
                    </label>
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="VD: CV_Tran_Van_A_2025"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">CV sẽ được lưu vào "Quản lý CV" của bạn.</p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowUpload(false)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                      disabled={uploading}
                    >
                      <ArrowLeft className="h-4 w-4" /> Quay lại chọn CV có sẵn
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !uploadFile}
                      className={`flex-1 inline-flex items-center justify-center gap-2 ${uploading ? 'bg-primary-300' : 'bg-primary-600 hover:bg-primary-700'} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors`}
                    >
                      {uploading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Đang tải…</>) : (<><UploadCloud className="h-4 w-4" /> Tải lên & Nộp CV</>)}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
