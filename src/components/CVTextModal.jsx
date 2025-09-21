import React, { useMemo, useRef, useState } from 'react';

const HEADING_KEYWORDS = [
    'KINH NGHIỆM', 'Kinh nghiệm', 'HỌC VẤN', 'Học vấn', 'KỸ NĂNG', 'Kỹ năng',
    'DỰ ÁN', 'Dự án', 'CHỨNG CHỈ', 'Chứng chỉ', 'MỤC TIÊU NGHỀ NGHIỆP', 'Mục tiêu nghề nghiệp',
    'THÔNG TIN CÁ NHÂN', 'Thông tin cá nhân', 'NGOẠI NGỮ', 'Ngoại ngữ', 'GIẢI THƯỞNG', 'Giải thưởng',
    'HOẠT ĐỘNG', 'Hoạt động', 'SỞ THÍCH', 'Sở thích', 'LIÊN HỆ', 'Liên hệ'
];

function isAllCaps(text) {
    const letters = text.replace(/[^A-Za-zÀ-ỹ]/g, '');
    if (letters.length < 4) return false;
    return letters === letters.toUpperCase();
}

function lineLooksHeading(line) {
    if (!line) return false;
    if (HEADING_KEYWORDS.some(k => line.includes(k))) return true;
    if (/[:：]\s*$/.test(line) && line.length < 80) return true;
    if (isAllCaps(line.trim()) && line.trim().length < 80) return true;
    return false;
}

export default function CVTextModal({ isOpen, onClose, title = 'Xem nội dung CV', text = '' }) {
    const [fontSize, setFontSize] = useState(14);
    const containerRef = useRef(null);

    // Canonical section mapping
    const SECTION_ALIASES = useMemo(() => ([
        { key: 'personal', titles: ['THÔNG TIN CÁ NHÂN', 'Thông tin cá nhân', 'Thông tin', 'Thông Tin Cá Nhân'] },
        { key: 'objective', titles: ['MỤC TIÊU NGHỀ NGHIỆP', 'Mục tiêu nghề nghiệp', 'Mục tiêu', 'MỤC TIÊU'] },
        { key: 'skills', titles: ['KỸ NĂNG', 'Kỹ năng', 'Skills'] },
        { key: 'experience', titles: ['KINH NGHIỆM', 'Kinh nghiệm', 'Kinh nghiệm làm việc', 'KINH NGHIEM'] },
        { key: 'projects', titles: ['DỰ ÁN', 'Dự án', 'Projects'] },
        { key: 'education', titles: ['HỌC VẤN', 'Học vấn', 'Học tập', 'Education'] },
        { key: 'certs', titles: ['CHỨNG CHỈ', 'Chứng chỉ', 'Chứng nhận'] },
        { key: 'languages', titles: ['NGOẠI NGỮ', 'Ngoại ngữ', 'Ngôn ngữ'] },
        { key: 'activities', titles: ['HOẠT ĐỘNG', 'Hoạt động'] },
        { key: 'awards', titles: ['GIẢI THƯỞNG', 'Giải thưởng'] },
        { key: 'interests', titles: ['SỞ THÍCH', 'Sở thích'] },
        { key: 'contact', titles: ['LIÊN HỆ', 'Liên hệ', 'Contact'] },
    ]), []);

    const aliasMap = useMemo(() => {
        const m = new Map();
        SECTION_ALIASES.forEach(({ key, titles }) => titles.forEach(t => m.set(t.toLowerCase(), key)));
        return m;
    }, [SECTION_ALIASES]);

    const normalizeHeading = (line) => {
        const raw = line.replace(/[:：]\s*$/, '').trim();
        const key = aliasMap.get(raw.toLowerCase());
        return key ? { key, title: raw } : null;
    };

    const plainBlocks = useMemo(() => {
        const lines = (text || '').split(/\r?\n/);
        const blocks = [];
        let listBuffer = [];
        const bulletPrefix = /^\s*([-•*●◦▪►‣✔✓·■☑⬥⟡‒–—]+)\s+/; // broadened bullet set
        const flushList = () => {
            if (listBuffer.length) {
                listBuffer.forEach((li, idx) => {
                    blocks.push(
                        <p key={`li-${blocks.length}-${idx}`} className="leading-relaxed text-gray-800">- {li}</p>
                    );
                });
                listBuffer = [];
            }
        };
        for (let i = 0; i < lines.length; i++) {
            const line = (lines[i] || '').trimEnd();
            if (bulletPrefix.test(line)) { listBuffer.push(line.replace(bulletPrefix, '')); continue; }
            if (line.trim() === '') { flushList(); blocks.push(<div key={`sp-${i}`} className="h-2" />); continue; }
            if (lineLooksHeading(line)) {
                flushList();
                blocks.push(<p key={`h-${i}`} className="mt-3 mb-1 font-semibold text-gray-900">{line.replace(/[:：]\s*$/, '')}</p>);
                continue;
            }
            flushList();
            blocks.push(<p key={`p-${i}`} className="text-gray-800 leading-relaxed">{line}</p>);
        }
        flushList();
        return blocks;
    }, [text]);

    const structuredSections = useMemo(() => {
        const lines = (text || '').split(/\r?\n/);
        const sections = [];
        let current = { key: 'general', title: 'Thông tin', lines: [] };
        const pushSection = () => { if (current.lines.length) sections.push(current); };

        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i] || '';
            const line = raw.trimEnd();
            if (line.trim() === '') { current.lines.push(''); continue; }
            const h = normalizeHeading(line) || (lineLooksHeading(line) ? { key: 'section', title: line.replace(/[:：]\s*$/, '') } : null);
            if (h) {
                if (current.lines.length) pushSection();
                current = { key: h.key, title: h.title, lines: [] };
                continue;
            }
            current.lines.push(line);
        }
        pushSection();

        const toBlocks = (ls) => {
            const blocks = [];
            let buf = [];
            let listBuf = [];
            const bulletPrefix = /^\s*([-•*●◦▪►‣✔✓·■☑⬥⟡‒–—]+)\s+/;
            const flushPara = () => { if (buf.length) { blocks.push({ type: 'p', text: buf.join(' ') }); buf = []; } };
            const flushList = () => { if (listBuf.length) { blocks.push({ type: 'ul', items: listBuf.slice() }); listBuf = []; } };
            for (const lRaw of ls) {
                const l = (lRaw || '').trimEnd();
                if (l.trim() === '') { flushPara(); flushList(); continue; }
                if (bulletPrefix.test(l)) { flushPara(); listBuf.push(l.replace(bulletPrefix, '')); continue; }
                // sub heading pattern with dates
                if (/\b(\d{2}\/\d{4}|\d{4})\b.*?-.*?\b(\d{2}\/\d{4}|\d{4}|hiện tại|nay)\b/i.test(l)) { flushPara(); flushList(); blocks.push({ type: 'h4', text: l }); continue; }
                buf.push(l);
            }
            flushPara(); flushList();
            return blocks;
        };

        return sections.map(s => ({ ...s, blocks: toBlocks(s.lines) }));
    }, [text, aliasMap]);

    if (!isOpen) return null;

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(text || '');
        } catch (e) {
            // Fallback: select and copy
            const el = document.createElement('textarea');
            el.value = text || '';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
    };

    const onDownload = () => {
        const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(title || 'cv').replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const incFont = () => setFontSize(s => Math.min(22, s + 1));
    const decFont = () => setFontSize(s => Math.max(12, s - 1));

    const renderSectionBlocks = (blocks, sectionIndex) => {
        return blocks.map((b, idx) => {
            if (b.type === 'p') {
                return <p key={`s${sectionIndex}-p${idx}`} className="text-gray-800 leading-relaxed">{b.text}</p>;
            }
            if (b.type === 'ul') {
                return (
                    <div key={`s${sectionIndex}-ul${idx}`} className="space-y-1">
                        {b.items.map((it, i2) => (
                            <p key={`s${sectionIndex}-ul${idx}-i${i2}`} className="leading-relaxed text-gray-800">- {it}</p>
                        ))}
                    </div>
                );
            }
            if (b.type === 'h4') {
                return <p key={`s${sectionIndex}-h4${idx}`} className="font-semibold text-gray-900 mt-2 mb-1">{b.text}</p>;
            }
            return null;
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <div className="min-w-0 pr-4">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">Hiển thị nội dung đã trích xuất từ PDF</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={decFont} className="px-2 py-1 text-sm rounded border hover:bg-gray-50" title="Giảm cỡ chữ">Giảm cỡ</button>
                        <button onClick={incFont} className="px-2 py-1 text-sm rounded border hover:bg-gray-50" title="Tăng cỡ chữ">Tăng cỡ</button>
                        <div className="w-px h-6 bg-gray-200 mx-1" />
                        <button onClick={onCopy} className="px-2 py-1 text-sm rounded border hover:bg-gray-50" title="Sao chép">Sao chép</button>
                        <button onClick={onDownload} className="px-2 py-1 text-sm rounded border hover:bg-gray-50" title="Tải TXT">Tải TXT</button>
                        <button onClick={onClose} className="ml-1 px-2 py-1 text-sm rounded border hover:bg-gray-50" aria-label="Đóng" title="Đóng">Đóng</button>
                    </div>
                </div>

                {/* Content */}
                <div ref={containerRef} className="flex-1 overflow-auto">
                    <div className={`mx-auto px-6 py-5`} style={{ fontSize }}>
                        {/* Decide whether to use structured grid or fallback to plain */}
                        {(() => {
                            const recognized = structuredSections.filter(s => s.key !== 'general' && s.key !== 'section');
                            const useGrid = recognized.length >= 1 && structuredSections.length >= 2;
                            if (!useGrid) {
                                return (
                                    <div className="max-w-3xl mx-auto">
                                        {plainBlocks}
                                    </div>
                                );
                            }
                            return (
                                <div className="max-w-5xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {structuredSections.map((s, idx) => (
                                            <section key={`sec-${idx}`} className="border border-gray-200 rounded-md p-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">{s.title}</h4>
                                                <div className="space-y-2">
                                                    {renderSectionBlocks(s.blocks, idx)}
                                                </div>
                                            </section>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
