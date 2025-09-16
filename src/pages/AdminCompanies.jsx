import React, { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { companiesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminCompanies = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // kept for loadAll errors (not shown on page)
    const [tab, setTab] = useState('pending'); // 'pending' | 'accepted' | 'rejected'
    const [selected, setSelected] = useState(null); // selected company for modal
    const [reviewDialog, setReviewDialog] = useState({ open: false, company: null, status: null, note: '', submitting: false, error: '' });
    const [modalError, setModalError] = useState('');
    const fileInputRef = useRef(null);
    const [editState, setEditState] = useState({
        editing: false,
        saving: false,
        uploading: false,
        newLogoFile: null,
        newLogoPreview: '',
        form: { name: '', legal_name: '', address: '', contact_phone: '', logo_url: '' }
    });

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
        const { data } = await companiesAPI.review(id, { status, review_note });
        const updated = data.company;
        setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
        setSelected((prev) => (prev && prev.id === id ? { ...prev, ...updated } : prev));
        return updated;
    };

    const openReviewDialog = (company, status) => {
        setReviewDialog({ open: true, company, status, note: '', submitting: false, error: '' });
    };

    // EmailJS configuration (Vite env variables)
    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ACCEPTED_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ACCEPTED_ID;
    const EMAILJS_TEMPLATE_REJECTED_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_REJECTED_ID;
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Helper to send email via EmailJS; non-blocking for UI
    const sendCompanyReviewEmail = async (company, status, note) => {
        const templateId = status === 'accepted' ? EMAILJS_TEMPLATE_ACCEPTED_ID : EMAILJS_TEMPLATE_REJECTED_ID;
        if (!EMAILJS_SERVICE_ID || !templateId || !EMAILJS_PUBLIC_KEY) {
            console.warn('EmailJS env variables missing. Skipping email send.');
            return;
        }
        if (!company?.email) {
            console.warn('Company email missing. Skipping email send.');
            return;
        }
        const params = {
            to_email: company.email,
            company_name: company.name,
            company_code: company.code,
            // Provide both keys in case template uses one or the other
            company_tax_code: company.tax_code,
            tax_code: company.tax_code,
            review_status: status,
            review_note: note || '',
        };
        try {
            await emailjs.send(EMAILJS_SERVICE_ID, templateId, params, { publicKey: EMAILJS_PUBLIC_KEY });
            toast.success(status === 'accepted' ? 'Đã gửi email chấp nhận' : 'Đã gửi email từ chối');
        } catch (err) {
            console.error('EmailJS send failed', err);
            const msg = typeof err?.text === 'string' && err.text.toLowerCase().includes('recipients address is empty')
                ? 'Thiếu người nhận trong EmailJS. Mở template và đặt "To email" = {{to_email}} hoặc cấu hình email mặc định.'
                : 'Gửi email thất bại';
            toast.error(msg);
        }
    };

    // Small helper to wait
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    // After review, poll for fields that may be generated asynchronously (code, tax_code, email)
    const waitForCompanyFieldsAndSend = async (baseCompany, status, note) => {
        const id = baseCompany?.id;
        if (!id) return;
        const maxAttempts = 6; // ~3s total with 500ms interval
        let latest = baseCompany;
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const { data } = await companiesAPI.getById(id);
                latest = data.company || latest;
            } catch {
                // ignore fetch errors and retry
            }
            if (latest?.email && latest?.code && latest?.tax_code) break;
            await sleep(500);
        }
        // Send with the best data we have
        await sendCompanyReviewEmail(latest, status, note);
    };

    const startEdit = (company) => {
        setModalError('');
        setEditState({
            editing: true,
            saving: false,
            uploading: false,
            newLogoFile: null,
            newLogoPreview: '',
            form: {
                name: company.name || '',
                legal_name: company.legal_name || '',
                address: company.address || '',
                contact_phone: company.contact_phone || '',
                logo_url: company.logo_url || ''
            }
        });
    };

    const cancelEdit = () => {
        // Revoke any preview URL and clear file input
        if (editState.newLogoPreview) {
            try { URL.revokeObjectURL(editState.newLogoPreview); } catch { }
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
        setEditState((e) => ({ ...e, editing: false, newLogoFile: null, newLogoPreview: '', uploading: false }));
    };

    const saveEdit = async () => {
        if (!selected) return;
        try {
            setEditState((e) => ({ ...e, saving: true }));
            // If a new logo file was chosen, validate size and upload now (errors only appear on Save)
            let nextLogoUrl = editState.form.logo_url || '';
            if (editState.newLogoFile) {
                const max = 3 * 1024 * 1024; // 3MB
                if (editState.newLogoFile.size > max) {
                    setModalError('Kích cỡ ảnh quá lớn, tối đa 3MB.');
                    setEditState((s) => ({ ...s, saving: false }));
                    return;
                }
                try {
                    setEditState((s) => ({ ...s, uploading: true }));
                    const { data } = await companiesAPI.uploadLogo(editState.newLogoFile);
                    nextLogoUrl = data.file_url;
                } catch (err) {
                    setModalError(err.response?.data?.message || 'Tải logo thất bại');
                    setEditState((s) => ({ ...s, saving: false, uploading: false }));
                    return;
                } finally {
                    // Clear file input and revoke preview URL
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    if (editState.newLogoPreview) {
                        try { URL.revokeObjectURL(editState.newLogoPreview); } catch { }
                    }
                }
            }
            // Only send allowed fields (excluding tax_code, code, email, etc.)
            const payload = {
                name: editState.form.name,
                legal_name: editState.form.legal_name,
                address: editState.form.address,
                contact_phone: editState.form.contact_phone,
                logo_url: nextLogoUrl,
            };
            const { data } = await companiesAPI.update(selected.id, payload);
            // Reflect updates locally
            setItems((prev) => prev.map((c) => (c.id === selected.id ? { ...c, ...data.company } : c)));
            setSelected((prev) => prev ? { ...prev, ...data.company } : prev);
            setEditState({ editing: false, saving: false, uploading: false, newLogoFile: null, newLogoPreview: '', form: { name: '', legal_name: '', address: '', contact_phone: '', logo_url: '' } });
        } catch (e) {
            setModalError(e.response?.data?.message || 'Không thể cập nhật công ty');
            setEditState((s) => ({ ...s, saving: false }));
        }
    };

    // When opening the modal, ensure we have the complete record (fetch if key fields are missing)
    useEffect(() => {
        const ensureFull = async () => {
            if (!selected) return;
            const needsFetch = selected.email === undefined || selected.code === undefined || selected.updated_at === undefined;
            if (needsFetch) {
                try {
                    const { data } = await companiesAPI.getById(selected.id);
                    setSelected((prev) => (prev && prev.id === selected.id ? { ...prev, ...data.company } : prev));
                } catch (e) {
                    // non-blocking
                }
            }
        };
        ensureFull();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected?.id]);

    // Auto-exit edit mode if selected is cleared or not accepted
    useEffect(() => {
        if (!selected && editState.editing) {
            cancelEdit();
        } else if (selected && editState.editing && selected.status !== 'accepted') {
            cancelEdit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected?.id, selected?.status]);

    // Xóa công ty đã được yêu cầu loại bỏ khỏi tính năng

    const closeReviewDialog = () => setReviewDialog({ open: false, company: null, status: null, note: '', submitting: false, error: '' });

    const submitReview = async () => {
        if (!reviewDialog.company || !reviewDialog.status) return;
        try {
            setReviewDialog((d) => ({ ...d, submitting: true }));
            const updated = await review(reviewDialog.company.id, reviewDialog.status, reviewDialog.note);
            // Fire-and-forget: wait briefly for generated fields, then send email
            waitForCompanyFieldsAndSend(updated || reviewDialog.company, reviewDialog.status, reviewDialog.note)
                .catch((e) => console.warn('Email notification failed later:', e));
            // Also close the details modal so no popup remains
            cancelEdit();
            setSelected(null);
            setModalError('');
            closeReviewDialog();
        } catch (e) {
            const msg = e.response?.data?.message || 'Lỗi duyệt công ty';
            setReviewDialog((d) => ({ ...d, submitting: false, error: msg }));
        }
    };

    if (loading) return <div>Đang tải...</div>;

    // Sort helpers: newest first
    const sortByDateDesc = (arr, primaryKey, fallbackKey = 'created_at') =>
        arr.slice().sort((a, b) => new Date(b[primaryKey] || b[fallbackKey] || 0) - new Date(a[primaryKey] || a[fallbackKey] || 0));

    const pendingList = sortByDateDesc(items.filter((c) => c.status === 'pending'), 'created_at');
    const acceptedList = sortByDateDesc(items.filter((c) => c.status === 'accepted'), 'reviewed_at');
    const rejectedList = sortByDateDesc(items.filter((c) => c.status === 'rejected'), 'reviewed_at');
    const currentList = tab === 'pending' ? pendingList : tab === 'accepted' ? acceptedList : rejectedList;



    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Duyệt công ty</h1>

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
                    onClick={() => { cancelEdit(); setSelected(null); setModalError(''); }}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">{selected.name}</h2>
                                {/* Hidden company ID per request */}
                            </div>
                            <div className={`px-2 py-1 rounded text-sm ${selected.status === 'accepted' ? 'bg-green-100 text-green-700' : selected.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {selected.status}
                            </div>
                        </div>

                        {modalError && (
                            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
                                {modalError}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="text-gray-500 text-sm">Email</div>
                                <div className="font-medium break-all">{selected.email || '-'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Mã công ty (code)</div>
                                <div className="font-medium">{selected.code || '-'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Tên pháp lý</div>
                                {editState.editing && selected.status === 'accepted' ? (
                                    <input value={editState.form.legal_name} onChange={(e) => { setModalError(''); setEditState((s) => ({ ...s, form: { ...s.form, legal_name: e.target.value } })); }} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium">{selected.legal_name || '-'}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Mã số thuế</div>
                                <div className="font-medium">{selected.tax_code || '-'}</div>
                                {/* Always read-only; backend also blocks edits */}
                            </div>
                            <div className="sm:col-span-2">
                                <div className="text-gray-500 text-sm">Địa chỉ</div>
                                {editState.editing && selected.status === 'accepted' ? (
                                    <input value={editState.form.address} onChange={(e) => { setModalError(''); setEditState((s) => ({ ...s, form: { ...s.form, address: e.target.value } })); }} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium">{selected.address}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">SĐT</div>
                                {editState.editing && selected.status === 'accepted' ? (
                                    <input value={editState.form.contact_phone} onChange={(e) => { setModalError(''); setEditState((s) => ({ ...s, form: { ...s.form, contact_phone: e.target.value } })); }} className="w-full border rounded px-2 py-1" />
                                ) : (
                                    <div className="font-medium">{selected.contact_phone || '-'}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm">Logo</div>
                                {editState.editing && selected.status === 'accepted' ? (
                                    <div className="space-y-2">
                                        {(editState.newLogoPreview || editState.form.logo_url) && (
                                            <img src={editState.newLogoPreview || editState.form.logo_url} alt="logo" className="h-12 w-12 object-cover rounded border" />
                                        )}
                                        <label className={`inline-flex items-center gap-2 px-3 py-2 border rounded bg-white ${editState.uploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v8a2 2 0 002 2h3.5a1.5 1.5 0 100-3H5V6h10v2.5a1.5 1.5 0 003 0V5a2 2 0 00-2-2H4z" /><path d="M16 13a1 1 0 00-1-1h-3V9a1 1 0 10-2 0v3H7a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 001-1z" /></svg>
                                            <span>Tải logo từ máy</span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={editState.uploading}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setModalError('');
                                                    // create preview and store file; do not upload now
                                                    const preview = URL.createObjectURL(file);
                                                    // Cleanup old preview
                                                    if (editState.newLogoPreview) {
                                                        try { URL.revokeObjectURL(editState.newLogoPreview); } catch { }
                                                    }
                                                    setEditState((s) => ({ ...s, newLogoFile: file, newLogoPreview: preview }));
                                                    // reset input value to allow reselect same file
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                            />
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
                                {editState.editing && selected.status === 'accepted' ? (
                                    <input value={editState.form.name} onChange={(e) => { setModalError(''); setEditState((s) => ({ ...s, form: { ...s.form, name: e.target.value } })); }} className="w-full border rounded px-2 py-1" />
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
                            <div>
                                <div className="text-gray-500 text-sm">Cập nhật lúc</div>
                                <div className="font-medium">{selected.updated_at ? new Date(selected.updated_at).toLocaleString() : '-'}</div>
                            </div>
                            {/* Reviewer ID hidden per request */}
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
                                    // Only allow editing for accepted companies
                                    selected.status === 'accepted' ? (
                                        <button onClick={() => startEdit(selected)} className="px-4 py-2 bg-blue-600 text-white rounded">Sửa</button>
                                    ) : null
                                ) : (
                                    <>
                                        <button onClick={cancelEdit} className="px-4 py-2 bg-gray-200 rounded">Huỷ</button>
                                        <button onClick={saveEdit} disabled={editState.saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{editState.saving ? 'Đang lưu...' : 'Lưu'}</button>
                                    </>
                                )}
                                <button onClick={() => { cancelEdit(); setSelected(null); setModalError(''); }} className="px-4 py-2 bg-gray-200 rounded">Đóng</button>
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
                        {reviewDialog.error && (
                            <div className="mb-3 p-3 rounded bg-red-50 text-red-700 border border-red-200">{reviewDialog.error}</div>
                        )}
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

