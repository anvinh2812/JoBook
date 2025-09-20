import React, { useEffect, useMemo, useState } from 'react';
import { recommendationsAPI, cvsAPI } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import ApplyModal from '../components/ApplyModal';
import { toast } from 'react-hot-toast';
import CVTextModal from '../components/CVTextModal';

const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    <div className="h-24 bg-gray-100 rounded"></div>
  </div>
);

export default function Recommendations() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [cvList, setCvList] = useState([]);
  const [cv, setCv] = useState(null);
  const [cvSummary, setCvSummary] = useState('');
  const [cvText, setCvText] = useState('');
  const [posts, setPosts] = useState([]);
  const [showCV, setShowCV] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applyPost, setApplyPost] = useState(null);
  const [appliedPostIds, setAppliedPostIds] = useState([]);
  // Check if already applied (simple client-side, can be improved with API if needed)
  const hasApplied = (postId) => appliedPostIds.includes(postId);

  const handleApply = (post) => {
    setApplyPost(post);
    setShowApply(true);
  };

  const handleSubmitApply = async ({ post_id, cv_id }) => {
    try {
      await import('../services/api').then(({ applicationsAPI }) =>
        applicationsAPI.apply({ post_id, cv_id })
      );
      setAppliedPostIds(ids => [...ids, post_id]);
      toast.success('Nộp CV thành công!');
      setShowApply(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Nộp CV thất bại');
    }
  };

  const cvId = useMemo(() => {
    const v = parseInt(searchParams.get('cvId') || '', 10);
    return Number.isFinite(v) ? v : null;
  }, [searchParams]);

  useEffect(() => {
    if (user?.account_type !== 'candidate') return;
    const load = async () => {
      try {
        // Load own CVs to let user switch
        const { data: cvRes } = await cvsAPI.getCVs();
        setCvList(cvRes.cvs || []);

        let targetCvId = cvId;
        if (!targetCvId && (cvRes.cvs || []).length > 0) {
          // default to most recent active CV if available
          const activeFirst = [...cvRes.cvs].sort((a, b) => (b.is_active === a.is_active ? 0 : (b.is_active ? 1 : -1))).reverse();
          targetCvId = activeFirst[0]?.id;
          if (targetCvId) setSearchParams({ cvId: String(targetCvId) }, { replace: true });
        }
        if (!targetCvId) {
          setLoading(false);
          return;
        }

  setLoading(true);
  // Clear posts immediately so old highlights don't linger when switching CV
  setPosts([]);
        const { data } = await recommendationsAPI.get(targetCvId);
        setCv(data.cv);
        setCvSummary(data.cvSummary || '');
        setCvText(data.cvText || '');
        // Ensure client-side sort by relevance desc as a safeguard
        setPosts((data.posts || []).slice().sort((a, b) => (b.relevance - a.relevance)));
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.message || 'Không tải được gợi ý');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cvId, user, setSearchParams]);

  const handleSwitchCV = (e) => {
    const newId = e.target.value;
    if (newId) setSearchParams({ cvId: newId });
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="bg-white border rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Gợi ý phù hợp</h2>
          <div className="text-gray-400">•</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Chọn CV:</span>
            <select className="border rounded px-2 py-1 text-sm" value={cvId || ''} onChange={handleSwitchCV}>
              <option value="" disabled>-- Chọn CV --</option>
              {cvList.map(item => (
                <option key={item.id} value={item.id}>{item.name || `CV #${item.id}`}</option>
              ))}
            </select>
          </div>
          {cv && (
            <div className="ml-3 text-sm text-gray-600">Đang xem: <span className="font-medium">{cv.name}</span></div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1.5 text-sm rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            disabled={!cvText}
            onClick={() => setShowCV(true)}
          >
            Xem nội dung CV
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <Skeleton />
        ) : posts.length === 0 ? (
          <div className="text-gray-500">Chưa có gợi ý phù hợp.</div>
        ) : (
          posts.filter(p => (p?.relevance || 0) > 0).map((p) => (
            <div key={`${cvId || cv?.id || 'cv'}-${p.id}`} className="relative">
              <div className="absolute right-2 top-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                Phù hợp: {p.relevance}%
              </div>
              <PostCard
                post={p}
                currentUser={user}
                onApply={() => {
                  if (hasApplied(p.id)) {
                    toast('Bạn đã ứng tuyển vào bài này rồi', { icon: 'ℹ️' });
                    return;
                  }
                  handleApply(p);
                }}
              />
              {hasApplied(p.id) && (
                <div className="mt-2 text-xs text-green-600 font-medium">Đã nộp CV</div>
              )}
              {p.reason && (
                <div className="mt-2 text-xs text-gray-500">Lý do: {p.reason}</div>
              )}
            </div>
          ))
        )}
      {/* Apply Modal */}
      {showApply && applyPost && (
        <ApplyModal
          post={applyPost}
          onClose={() => setShowApply(false)}
          onSubmit={handleSubmitApply}
        />
      )}
      </div>

      {/* CV Content Modal */}
      {showCV && (
        <CVTextModal
          isOpen={showCV}
          onClose={() => setShowCV(false)}
          title={`Xem nội dung CV • ${cv?.name || ''}`}
          text={cvText}
        />
      )}
    </div>
  );
}
