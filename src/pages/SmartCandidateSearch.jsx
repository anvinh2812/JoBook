import React, { useState } from 'react';
import { smartAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import notify from '../utils/notify';

const SmartCandidateSearch = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [tokens, setTokens] = useState(null);

    const runSearch = async () => {
        try {
            if (!query.trim()) return;
            setLoading(true);
            const res = await smartAPI.search(query);
            setResults(res.data.items || []);
            setTokens(res.data.tokens || null);
        } catch (err) {
            console.error(err);
            notify.error(err, 'Lỗi khi tìm kiếm thông minh');
        } finally {
            setLoading(false);
        }
    };

    const onApply = () => { };
    const onViewCV = () => { };
    const onEdit = () => { };
    const onDelete = () => { };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Tìm ứng viên phù hợp</h1>
                <p className="text-gray-600 mb-4">Nhập tiêu chí tuyển dụng (ví dụ: "tuyển junior 2 năm kinh nghiệm, full stack, java").</p>
                <div className="flex gap-3">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Nhập tiêu chí..."
                    />
                    <button
                        onClick={runSearch}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'}`}
                    >
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </div>
                {tokens && (
                    <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Tiêu chí nhận diện:</span>{' '}
                        <span>Kỹ năng: {(tokens.skills || []).join(', ') || '—'}</span>{' '}
                        <span className="ml-3">Vai trò: {(tokens.roles || []).join(', ') || '—'}</span>{' '}
                        <span className="ml-3">Kinh nghiệm: {tokens.years ?? '—'} năm</span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                ) : results.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                        Chưa có kết quả. Hãy nhập tiêu chí và nhấn Tìm kiếm.
                    </div>
                ) : (
                    results.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUser={user}
                            onApply={onApply}
                            onViewCV={onViewCV}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SmartCandidateSearch;
