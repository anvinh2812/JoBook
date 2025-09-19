import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI, cvsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notify from '../utils/notify';
import CVViewerModal from '../components/CVViewerModal';
import ReadMore from '../components/ReadMore';

const Applications = () => {
  const [myApplications, setMyApplications] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('sent');
  const [loading, setLoading] = useState(true);
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvUrl, setCvUrl] = useState('');
  const [statusFilter, setStatusFilter] = useState(null); // 'pending' | 'accepted' | 'rejected' | null
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      if (user.account_type === 'candidate') {
        const response = await applicationsAPI.getMyApplications();
        setMyApplications(response.data.applications);
      } else {
        const response = await applicationsAPI.getReceivedApplications();
        setReceivedApplications(response.data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await applicationsAPI.updateStatus(applicationId, status);
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      notify.error('Lỗi khi cập nhật trạng thái');
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'reviewed':
        return 'Đã xem';
      case 'accepted':
        return 'Đã chấp nhận';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  // Accent colors for card left border and status dot
  const getStatusAccent = (status) => {
    switch (status) {
      case 'pending':
        return { border: 'border-yellow-400', dot: 'bg-yellow-400' };
      case 'reviewed':
        return { border: 'border-blue-400', dot: 'bg-blue-400' };
      case 'accepted':
        return { border: 'border-green-500', dot: 'bg-green-500' };
      case 'rejected':
        return { border: 'border-red-500', dot: 'bg-red-500' };
      default:
        return { border: 'border-gray-300', dot: 'bg-gray-300' };
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

  // Set default tab based on account type
  useEffect(() => {
    if (user.account_type === 'candidate') {
      setActiveTab('sent');
    } else {
      setActiveTab('received');
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {user.account_type === 'candidate' ? 'CV đã nộp' : 'CV nhận được'}
        </h1>

        <p className="text-gray-600">
          {user.account_type === 'candidate'
            ? 'Theo dõi tình trạng các CV bạn đã nộp vào các bài đăng tuyển dụng.'
            : 'Quản lý và xét duyệt các CV ứng viên đã nộp vào bài đăng của bạn.'
          }
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Sent Applications (for candidates) */}
            {user.account_type === 'candidate' && (
              <div>
                {myApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có ứng tuyển nào</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Bạn chưa nộp CV vào bài đăng nào.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Filter controls */}
                    <div className="px-6 pt-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-500 mr-2">Lọc trạng thái:</span>
                        {[
                          { key: 'pending', label: 'Chờ xử lý' },
                          { key: 'accepted', label: 'Đã chấp nhận' },
                          { key: 'rejected', label: 'Đã từ chối' },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              // Toggle: if already selected, clear filter
                              setStatusFilter((prev) => (prev === opt.key ? null : opt.key));
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm border transition ${statusFilter === opt.key
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* List: use spacing instead of divide to avoid overriding left border color */}
                    <div className="mt-4 space-y-4">
                      {(statusFilter ? myApplications.filter((a) => a.status === statusFilter) : myApplications).map((application) => (
                        <div
                          key={application.id}
                          className={`p-6 rounded-lg bg-white hover:bg-gray-50 transition border border-gray-200 border-l-4 ${getStatusAccent(application.status).border}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-3 flex items-center justify-between">
                                <div className="inline-flex items-center gap-2">
                                  <span className={`h-2 w-2 rounded-full ${getStatusAccent(application.status).dot}`}></span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                    {getStatusText(application.status)}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">{formatDate(application.created_at)}</div>
                              </div>

                              <div className="text-gray-800 space-y-3">
                                <div className="flex items-start gap-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                    Công ty
                                  </span>
                                  <div className="mt-0.5">
                                    {application.company_name ? (
                                      <span className="font-semibold">{application.company_name}</span>
                                    ) : (
                                      <span className="italic text-gray-500">(Không có công ty)</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                                    Bài viết của
                                  </span>
                                  <div className="mt-0.5 font-semibold">
                                    {application.author_type === 'admin' ? (
                                      <span>{application.author_name}</span>
                                    ) : (
                                      <Link to={`/users/${application.author_id}?post=${application.post_id}`} className="text-primary-700 hover:underline">
                                        {application.author_name}
                                      </Link>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                    Tiêu đề
                                  </span>
                                  <div className="mt-0.5 font-semibold">“{application.post_title}”</div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                    Nội dung
                                  </span>
                                  <div className="flex-1">
                                    <ReadMore
                                      text={application.post_description}
                                      lines={5}
                                      className="mt-0.5 text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-md p-3"
                                    />
                                  </div>
                                </div>
                              </div>

                            </div>

                            <div className="ml-4">
                              <button
                                onClick={() => handleViewCV(application.cv_id)}
                                className="bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                              >
                                Xem CV đã nộp
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* No result for filter */}
                    {statusFilter && (statusFilter ? myApplications.filter((a) => a.status === statusFilter).length === 0 : false) && (
                      <div className="text-center py-10 text-sm text-gray-500">Không có ứng tuyển với trạng thái đã chọn.</div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Received Applications (for companies) */}
            {user.account_type === 'company' && (
              <div>
                {receivedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có ứng viên nào</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Chưa có ứng viên nào nộp CV vào bài đăng của bạn.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {receivedApplications.map((application) => (
                      <div key={application.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {application.applicant_name}
                              </h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {getStatusText(application.status)}
                              </span>
                            </div>

                            <p className="text-gray-600 mb-2">
                              Email: {application.applicant_email}
                            </p>

                            <p className="text-gray-700 text-sm mb-2">
                              Ứng tuyển vào: {application.post_title}
                            </p>

                            {application.applicant_bio && (
                              <p className="text-gray-600 text-sm mb-3">
                                Giới thiệu: {application.applicant_bio}
                              </p>
                            )}

                            <div className="text-sm text-gray-500">
                              Nộp vào: {formatDate(application.created_at)}
                            </div>
                          </div>

                          <div className="ml-4 space-y-2">
                            <button
                              onClick={() => handleViewCV(application.cv_id)}
                              className="block w-full bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                            >
                              Xem CV
                            </button>

                            {application.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'accepted')}
                                  className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700"
                                >
                                  Chấp nhận
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700"
                                >
                                  Từ chối
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
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
    </div>
  );
};

export default Applications;
