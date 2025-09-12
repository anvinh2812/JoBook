import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { companiesAPI } from '../services/api';

const RegisterModal = ({ onClose, presetAccountType, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        account_type: 'candidate',
        bio: '',
        tax_code: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const translateRegisterError = (msg = '') => {
        const m = (msg || '').toLowerCase();
        if (m.includes('email already') || m.includes('duplicate') || m.includes('exists')) return 'Email đã được sử dụng';
        if (m.includes('weak password') || m.includes('password')) return 'Mật khẩu không hợp lệ hoặc quá yếu';
        if (m.includes('invalid') && m.includes('email')) return 'Email không hợp lệ';
        if (m.includes('network')) return 'Lỗi mạng, vui lòng thử lại';
        return 'Đăng ký thất bại, vui lòng kiểm tra thông tin và thử lại';
    };

    useEffect(() => {
        if (presetAccountType === 'company' || presetAccountType === 'candidate') {
            setFormData((prev) => ({ ...prev, account_type: presetAccountType }));
        }
    }, [presetAccountType]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (formData.account_type === 'company' && !formData.tax_code) {
            setError('Vui lòng nhập Mã số thuế công ty');
            return;
        }

        // If registering as company account, check company status by tax code first
        if (formData.account_type === 'company' && formData.tax_code) {
            try {
                const res = await companiesAPI.byTax(formData.tax_code);
                const status = (res?.data?.status || '').toUpperCase();
                if (status === 'PENDING') {
                    setError('công ty đang chờ xét duyệt xin vui lòng thử lại sau');
                    return;
                }
            } catch (err) {
                // If company not found or API error, let backend validation handle it as before
            }
        }

        setLoading(true);
        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);

        if (result.success) {
            onClose?.();
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (savedUser?.account_type === 'admin') {
                navigate('/admin/companies');
            } else {
                navigate('/');
            }
        } else {
            setError(translateRegisterError(result.message));
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg h-[85vh] overflow-y-auto relative">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-blue-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo tài khoản của bạn</h2>
                    <p className="text-gray-600">Tham gia cùng hàng nghìn chuyên gia tìm kiếm công việc mơ ước</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                            <input id="full_name" name="full_name" type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Nhập họ và tên" value={formData.full_name} onChange={handleChange} />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input id="email" name="email" type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="email@vi.du" value={formData.email} onChange={handleChange} />
                        </div>

                        <div>
                            <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 mb-2">Loại tài khoản</label>
                            <select id="account_type" name="account_type" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" value={formData.account_type} onChange={handleChange}>
                                <option value="candidate">Ứng viên</option>
                                <option value="company">Nhà tuyển dụng</option>
                            </select>
                        </div>

                        {formData.account_type === 'company' && (
                            <div>
                                <label htmlFor="tax_code" className="block text-sm font-medium text-gray-700 mb-2">Mã số thuế công ty</label>
                                <input id="tax_code" name="tax_code" type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Nhập MST công ty (đã được admin duyệt)" value={formData.tax_code} onChange={handleChange} />
                            </div>
                        )}

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                            <input id="address" name="address" type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Nhập địa chỉ" value={formData.address} onChange={handleChange} />
                        </div>

                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu (tuỳ chọn)</label>
                            <textarea id="bio" name="bio" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Giới thiệu về bạn hoặc công ty của bạn..." value={formData.bio} onChange={handleChange} />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                            <input id="password" name="password" type="password" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)" value={formData.password} onChange={handleChange} />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <span className="text-gray-600">Đã có tài khoản? </span>
                    <button
                        onClick={() => {
                            onClose?.();
                            onSwitchToLogin?.();
                        }}
                        className="text-blue-600 font-semibold hover:text-blue-500"
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
