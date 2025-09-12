import React, { useEffect, useRef, useState } from 'react';

// Reusable multi-line clamp with toggle
// Props: text (string), lines (number, default 8), className (string), scrollTargetId (string | undefined)
const ReadMore = ({ text = '', lines = 5, className = '', scrollTargetId }) => {
    const [expanded, setExpanded] = useState(false);
    const [showToggle, setShowToggle] = useState(false);
    const contentRef = useRef(null);

    const clampStyle = expanded
        ? { whiteSpace: 'pre-wrap' }
        : {
            display: '-webkit-box',
            WebkitLineClamp: lines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
        };

    // Measure if content overflows when clamped
    useEffect(() => {
        const measure = () => {
            if (!contentRef.current) return;
            const el = contentRef.current;
            // Only measure in collapsed state; keep last known value when expanded
            if (!expanded) {
                const isOverflowing = el.scrollHeight > el.clientHeight + 1;
                setShowToggle(isOverflowing);
            }
        };

        // Defer measurement to next frame to ensure layout is applied
        const raf = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(raf);
    }, [text, lines, expanded]);

    // Re-measure on window resize when collapsed
    useEffect(() => {
        const onResize = () => {
            if (!expanded) {
                if (contentRef.current) {
                    const el = contentRef.current;
                    const isOverflowing = el.scrollHeight > el.clientHeight + 1;
                    setShowToggle(isOverflowing);
                }
            }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [expanded]);

    if (!text) return null;

    const handleToggle = () => {
        if (expanded) {
            setExpanded(false);
            // Smooth scroll to the top of the target (post card) when collapsing
            // Fallback to the content itself if target id not provided
            try {
                const target = (scrollTargetId && typeof document !== 'undefined')
                    ? document.getElementById(scrollTargetId)
                    : contentRef.current;
                if (target && target.scrollIntoView) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } catch (_) {
                // no-op
            }
        } else {
            setExpanded(true);
        }
    };

    return (
        <div>
            {/* Wrapper takes padding/background/border; inner handles the clamp to avoid padding affecting line clamp */}
            <div className={className}>
                <div ref={contentRef} style={clampStyle}>
                    {text}
                </div>
            </div>
            {showToggle && (
                <button
                    type="button"
                    onClick={handleToggle}
                    className="mt-2 text-sm text-primary-700 hover:text-primary-800 hover:underline"
                >
                    {expanded ? 'Thu gọn' : 'Xem thêm'}
                </button>
            )}
        </div>
    );
};

export default ReadMore;
