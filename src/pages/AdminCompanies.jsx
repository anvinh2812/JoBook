import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { companiesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminCompanies = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('pending'); // 'pending' | 'accepted' | 'rejected'
    const [selected, setSelected] = useState(null); // selected company for modal
    const [reviewDialog, setReviewDialog] = useState({ open: false, company: null, status: null, note: '', submitting: false });
    const [editState, setEditState] = useState({ editing: false, saving: false, uploading: false, form: { name: '', legal_name: '', tax_code: '', address: '', contact_phone: '', logo_url: '' } });

    const loadAll = async () => {
        try {
            const { data } = await companiesAPI.list({ status: 'all' });
            setItems(data.companies || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.account_type !== 'admin') {
            navigate('/');
            return;
        }
        loadAll();
    }, [user, navigate]);

    const review = async (id, status, review_note = '') => {
        try {
            await companiesAPI.review(id, { status, review_note });
            // Update status and note inline to keep item visible
            setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status, review_note, reviewed_at: status !== 'pending' ? new Date().toISOString() : c.reviewed_at } : c)));
            // Sync selected modal if it's the same company
            setSelected((prev) => (prev && prev.id === id ? { ...prev, status, review_note, reviewed_at: status !== 'pending' ? new Date().toISOString() : prev.reviewed_at } : prev));
        } catch (e) {
            setError(e.response?.data?.message || 'Lỗi duyệt công ty');
        }
    };

    const openReviewDialog = (company, status) => {
        setReviewDialog({ open: true, company, status, note: '', submitting: false });
    };
    const startEdit = (company) => {
        setEditState({
            editing: true, saving: false, form: {
                name: company.name || '',
                legal_name: company.legal_name || '',
                tax_code: company.tax_code || '',
                address: company.address || '',
                contact_phone: company.contact_phone || '',
                logo_url: company.logo_url || ''
            }
        });
    };

    const cancelEdit = () => setEditState((e) => ({ ...e, editing: false }));

    const saveEdit = async () => {
        if (!selected) return;
        try {
            setEditState((e) => ({ ...e, saving: true }));
            const { data } = await companiesAPI.update(selected.id, editState.form);
            // Reflect updates locally
            setItems((prev) => prev.map((c) => (c.id === selected.id ? { ...c, ...data.company } : c)));
            setSelected((prev) => prev ? { ...prev, ...data.company } : prev);
            setEditState({ editing: false, saving: false, uploading: false, form: { name: '', legal_name: '', tax_code: '', address: '', contact_phone: '', logo_url: '' } });
        } catch (e) {
            setError(e.response?.data?.message || 'Không thể cập nhật công ty');
            setEditState((s) => ({ ...s, saving: false }));
        }
    };

    // Xóa công ty đã được yêu cầu loại bỏ khỏi tính năng

    const closeReviewDialog = () => setReviewDialog({ open: false, company: null, status: null, note: '', submitting: false });

    const submitReview = async () => {
        if (!reviewDialog.company || !reviewDialog.status) return;
        try {
            setReviewDialog((d) => ({ ...d, submitting: true }));
            await review(reviewDialog.company.id, reviewDialog.status, reviewDialog.note);
            closeReviewDialog();
        } catch (e) {
            // error is handled in review; just stop submitting flag here
            setReviewDialog((d) => ({ ...d, submitting: false }));
        }
    };

    if (loading) return <div>Đang tải...</div>;

    const pendingList = items.filter((c) => c.status === 'pending');
    const acceptedList = items.filter((c) => c.status === 'accepted');
    const rejectedList = items.filter((c) => c.status === 'rejected');
    const currentList = tab === 'pending' ? pendingList : tab === 'accepted' ? acceptedList : rejectedList;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Duyệt công ty</h1>
            {error && <div className="mb-4 text-red-600">{error}</div>}

            {/* Tabs */}
            <div className="mb-4 flex gap-2 border-b">
                <button
                    className={`px-4 py-2 -mb-px border-b-2 ${tab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
                    onClick={() => setTab('pending')}
                >
                    Chờ duyệt ({pendingList.length})
                </button>
                <button
                    className={`px-4 py-2 -mb-px border-b-2 ${tab === 'accepted' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
                    onClick={() => setTab('accepted')}
                >
                    Đã duyệt ({acceptedList.length})
                </button>
                <button
                    className={`px-4 py-2 -mb-px border-b-2 ${tab === 'rejected' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
                    onClick={() => setTab('rejected')}
                >
                    Đã từ chối ({rejectedList.length})
                </button>
            </div>

            {currentList.length === 0 ? (
                <div>{tab === 'pending' ? 'Không có công ty chờ duyệt.' : tab === 'accepted' ? 'Chưa có công ty đã duyệt.' : 'Chưa có công ty bị từ chối.'}</div>
            ) : (
                <div className="grid gap-4">
                    {currentList.map((c) => (
                        <div
                            key={c.id}
                            className="bg-white rounded-lg border p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                            onClick={() => setSelected(c)}
                        >
                            <div>
                                <div className="font-semibold">{c.name}</div>
                                <div className="text-sm text-gray-600">MST: {c.tax_code}</div>
                                <div className="text-sm text-gray-600">Địa chỉ: {c.address}</div>
                                <div className="text-sm">
                                    Trạng thái: {' '}
                                    <span className={
                                        c.status === 'accepted' ? 'text-green-600' : c.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                    }>
                                        {c.status}
                                    </span>
                                </div>
                                {c.reviewed_at && (
                                    <div className="text-xs text-gray-500 mt-1">Duyệt lúc: {new Date(c.reviewed_at).toLocaleString()}</div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {c.status === 'pending' ? (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); openReviewDialog(c, 'accepted'); }} className="px-3 py-2 bg-green-600 text-white rounded">Chấp nhận</button>
                                        <button onClick={(e) => { e.stopPropagation(); openReviewDialog(c, 'rejected'); }} className="px-3 py-2 bg-red-600 text-white rounded">Từ chối</button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selected && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">{selected.name}</h2>
                                <div className="text-sm text-gray-500">ID: {selected.id}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-sm ${selected.status === 'accepted' ? 'bg-green-100 text-green-700' : selected.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {selected.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="text-gray-500 text-sm">Tên pháp lý</div>
                                {editState.editing ? (
                                    <input value={editState.form.legal_name} onChange={(e) => setEditState((s) => ({ ...s, form: { ...s.form, legal_name: e.target.value } }))} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium">{selected.legal_name || '-'}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Mã số thuế</div>
                                {editState.editing ? (
                                    <input value={editState.form.tax_code} onChange={(e) => setEditState((s) => ({ ...s, form: { ...s.form, tax_code: e.target.value } }))} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium">{selected.tax_code}</div>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <div className="text-gray-500 text-sm">Địa chỉ</div>
                                {editState.editing ? (
                                    <input value={editState.form.address} onChange={(e) => setEditState((s) => ({ ...s, form: { ...s.form, address: e.target.value } }))} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium">{selected.address}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">SĐT</div>
                                {editState.editing ? (
                                    <input value={editState.form.contact_phone} onChange={(e) => setEditState((s) => ({ ...s, form: { ...s.form, contact_phone: e.target.value } }))} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium">{selected.contact_phone || '-'}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Logo</div>
                                {editState.editing ? (
                                    <div className="space-y-2">
                                        {editState.form.logo_url && (
                                            <img src={editState.form.logo_url} alt="logo" className="h-12 w-12 object-cover rounded border" />
                                        )}
                                        <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer bg-white hover:bg-gray-50">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v8a2 2 0 002 2h3.5a1.5 1.5 0 100-3H5V6h10v2.5a1.5 1.5 0 003 0V5a2 2 0 00-2-2H4z" /><path d="M16 13a1 1 0 00-1-1h-3V9a1 1 0 10-2 0v3H7a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 001-1z" /></svg>
                                            <span>Tải logo từ máy</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                    setEditState((s) => ({ ...s, uploading: true }));
                                                    const { data } = await companiesAPI.uploadLogo(file);
                                                    setEditState((s) => ({ ...s, uploading: false, form: { ...s.form, logo_url: data.file_url } }));
                                                } catch (err) {
                                                    setError(err.response?.data?.message || 'Tải logo thất bại');
                                                    setEditState((s) => ({ ...s, uploading: false }));
                                                }
                                            }} />
                                        </label>
                                        {editState.uploading && <div className="text-sm text-gray-500">Đang tải logo...</div>}
                                    </div>
                                ) : selected.logo_url ? (
                                    <img src={selected.logo_url} alt="logo" className="h-12 w-12 object-cover rounded border" />
                                ) : (
                                    <div className="text-gray-400">(không có)</div>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Tên hiển thị</div>
                                {editState.editing ? (
                                    <input value={editState.form.name} onChange={(e) => setEditState((s) => ({ ...s, form: { ...s.form, name: e.target.value } }))} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium">{selected.name}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Tạo lúc</div>
                                <div className="font-medium">{new Date(selected.created_at).toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Duyệt lúc</div>
                                <div className="font-medium">{selected.reviewed_at ? new Date(selected.reviewed_at).toLocaleString() : '-'}</div>
                            </div>
                            <div className="sm:col-span-2">
                                <div className="text-gray-500 text-sm">Ghi chú duyệt</div>
                                <div className="font-medium whitespace-pre-wrap">{selected.review_note || '-'}</div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between gap-2">
                            <div className="flex gap-2"></div>
                            {selected.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => openReviewDialog(selected, 'accepted')}
                                        className="px-4 py-2 bg-green-600 text-white rounded"
                                    >
                                        Chấp nhận
                                    </button>
                                    <button
                                        onClick={() => openReviewDialog(selected, 'rejected')}
                                        className="px-4 py-2 bg-red-600 text-white rounded"
                                    >
                                        Từ chối
                                    </button>
                                </>
                            )}
                            <div className="flex gap-2">
                                {!editState.editing ? (
                                    <button onClick={() => startEdit(selected)} className="px-4 py-2 bg-blue-600 text-white rounded">Sửa</button>
                                ) : (
                                    <>
                                        <button onClick={cancelEdit} className="px-4 py-2 bg-gray-200 rounded">Huỷ</button>
                                        <button onClick={saveEdit} disabled={editState.saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{editState.saving ? 'Đang lưu...' : 'Lưu'}</button>
                                    </>
                                )}
                                <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-200 rounded">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Note Dialog */}
            {reviewDialog.open && reviewDialog.company && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeReviewDialog}>
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-2">{reviewDialog.status === 'accepted' ? 'Chấp nhận công ty' : 'Từ chối công ty'}</h3>
                        <p className="text-sm text-gray-600 mb-4">{reviewDialog.company.name} — MST: {reviewDialog.company.tax_code}</p>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú gửi công ty (tuỳ chọn)</label>
                        <textarea
                            className="w-full border rounded-lg p-3 h-28"
                            placeholder="Nhập ghi chú..."
                            value={reviewDialog.note}
                            onChange={(e) => setReviewDialog((d) => ({ ...d, note: e.target.value }))}
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={closeReviewDialog} className="px-4 py-2 bg-gray-200 rounded">Huỷ</button>
                            <button
                                onClick={submitReview}
                                disabled={reviewDialog.submitting}
                                className={`px-4 py-2 text-white rounded ${reviewDialog.status === 'accepted' ? 'bg-green-600' : 'bg-red-600'} disabled:opacity-50`}
                            >
                                {reviewDialog.submitting ? 'Đang gửi...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompanies;

