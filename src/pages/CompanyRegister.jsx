import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { companiesAPI } from '../services/api';

const CompanyRegister = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        legal_name: '',
        tax_code: '',
        address: '',
        contact_phone: '',
        logo_url: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const fileInputRef = useRef(null);
    const [successDialog, setSuccessDialog] = useState({ open: false, message: '' });

    // Ensure tax_code is only digits and max 10
    const onTaxCodeChange = (e) => {
        const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
        setForm((prev) => ({ ...prev, tax_code: digits }));
    };

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!form.name || !form.address || !form.email || !form.tax_code) {
            setError('Vui lòng nhập đủ: Tên công ty, Địa chỉ, Email, Mã số thuế');
            return;
        }
        if (!/^[0-9]{10}$/.test(String(form.tax_code))) {
            setError('Mã số thuế phải gồm đúng 10 chữ số');
            return;
        }
        setLoading(true);
        try {
            // If logo file selected, upload first to get URL
            let logo_url = form.logo_url || '';
            if (logoFile) {
                const fd = new FormData();
                fd.append('logo', logoFile);
                const uploadRes = await api.post('/companies/upload-logo', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                logo_url = uploadRes.data.file_url;
            }
            await companiesAPI.create({
                name: form.name,
                legal_name: form.legal_name || null,
                tax_code: form.tax_code,
                address: form.address,
                contact_phone: form.contact_phone || null,
                logo_url: logo_url || null,
                email: form.email,
            });
            const msg = 'Gửi đăng ký thành công. Công ty đang chờ admin duyệt.';
            setSuccess(msg);
            setSuccessDialog({ open: true, message: msg });
        } catch (e) {
            setError(e.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center">
                            <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                                <span className="font-bold text-xl">J</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">jobook</h1>
                        </Link>
                        <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">
                            Quay về trang chủ
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="bg-blue-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký công ty</h2>
                        <p className="text-gray-600">Điền thông tin công ty để tạo hồ sơ và chờ duyệt</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>
                    )}

                    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Hàng 1: Tên công ty & Tên pháp lý */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên công ty</label>
                            <input name="name" value={form.name} onChange={onChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="VD: Công ty ABC" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên pháp lý (tuỳ chọn)</label>
                            <input name="legal_name" value={form.legal_name} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="VD: CÔNG TY TNHH ABC" />
                        </div>

                        {/* Hàng 2: Email & Số điện thoại */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
                            <input name="email" type="email" value={form.email} onChange={onChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="VD: contact@congty.vn" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại (tuỳ chọn)</label>
                            <input name="contact_phone" value={form.contact_phone} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="VD: 0901234567" />
                        </div>

                        {/* MST: Full width */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mã số thuế (10 số)</label>
                            <input
                                name="tax_code"
                                value={form.tax_code}
                                onChange={onTaxCodeChange}
                                required
                                pattern="^[0-9]{10}$"
                                inputMode="numeric"
                                maxLength={10}
                                autoComplete="off"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="VD: 0312345678"
                            />
                            <p className="text-xs text-gray-500 mt-1">Nhập đúng 10 chữ số. Trùng với MST đã đăng ký của doanh nghiệp.</p>
                        </div>

                        {/* Địa chỉ: Full width */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                            <input name="address" value={form.address} onChange={onChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" />
                        </div>

                        {/* Logo: ô tải ảnh có icon trang trí */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo công ty (tuỳ chọn)</label>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="shrink-0 h-12 w-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                                                {/* Icon máy ảnh */}
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-blue-600">
                                                    <path d="M9 2a1 1 0 0 0-.894.553L7.382 4H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-2.382l-.724-1.447A1 1 0 0 0 14 2H9Zm3 6a5 5 0 1 1-5 5 5.006 5.006 0 0 1 5-5Zm0 2a3 3 0 1 0 3 3 3.004 3.004 0 0 0-3-3Z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700">
                                                    Kéo thả ảnh vào đây hoặc
                                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="ml-1 text-blue-600 hover:underline">chọn ảnh</button>
                                                </p>
                                                <p className="text-xs text-gray-500">Hỗ trợ PNG, JPG, JPEG, WEBP. Tối đa 3MB.</p>
                                            </div>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                setLogoFile(f || null);
                                                setLogoPreview(f ? URL.createObjectURL(f) : '');
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                {logoPreview && (
                                    <img src={logoPreview} alt="logo preview" className="h-16 w-16 object-cover rounded-lg border" />
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                                {loading ? 'Đang gửi...' : 'Gửi đăng ký công ty'}
                            </button>
                            <div className="text-center mt-4">
                                <Link to="/register" className="text-sm text-gray-600 underline">Tạo tài khoản người dùng</Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {successDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-2">Đăng ký thành công</h3>
                        <p className="text-gray-700 mb-6">{successDialog.message}</p>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => {
                                    setSuccessDialog({ open: false, message: '' });
                                    navigate('/');
                                    setTimeout(() => {
                                        try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch { }
                                    }, 0);
                                }}
                            >
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyRegister;
