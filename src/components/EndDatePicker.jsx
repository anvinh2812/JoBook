import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarRange, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// yyyy-mm-dd helpers
const toDate = (s) => (s ? new Date(s) : undefined);
const fromDate = (d) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
};

const fmtDDMM = (s) => {
    if (!s) return '';
    const [y, m, d] = s.split('-');
    if (!y || !m || !d) return s;
    return `${d}/${m}/${y}`;
};

const EndDatePicker = ({ value, onChange, onApply, onClear, invalid }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) {
            document.addEventListener('mousedown', onClick);
            document.addEventListener('keydown', onKey);
            // lock background scroll
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('mousedown', onClick);
                document.removeEventListener('keydown', onKey);
                document.body.style.overflow = prev;
            };
        }
        return undefined;
    }, [open]);

    const selected = useMemo(() => toDate(value), [value]);
    const label = useMemo(() => (value ? fmtDDMM(value) : 'Chọn ngày kết thúc'), [value]);

    // Disable past days (before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const disabled = [{ before: today }];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-gray-300 text-base text-gray-700 hover:bg-gray-50"
            >
                <CalendarRange className="w-5 h-5 text-primary-600" />
                <span className="whitespace-nowrap">{label}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                    {/* Panel */}
                    <div ref={ref} className="relative w-[360px] bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                        <DayPicker
                            mode="single"
                            selected={selected}
                            onSelect={(d) => onChange(fromDate(d))}
                            numberOfMonths={1}
                            weekStartsOn={1}
                            disabled={disabled}
                            modifiersClassNames={{ today: 'text-primary-600' }}
                            styles={{
                                day: { borderRadius: 10, width: 40, height: 36, fontSize: '14px' },
                                head_cell: { color: '#6b7280', fontWeight: 600, fontSize: '12px' },
                                caption_label: { fontSize: '16px', fontWeight: 700 },
                                nav_button: { width: 36, height: 36 },
                                nav_icon: { width: 18, height: 18 },
                                day_disabled: { color: '#9ca3af', cursor: 'not-allowed', textDecoration: 'line-through' },
                            }}
                            footer={
                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-xs text-gray-500">
                                        {invalid ? 'Ngày kết thúc không hợp lệ' : 'Chọn ngày kết thúc tuyển'}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onClear?.()}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-red-100 text-red-700 hover:bg-red-200"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Xóa
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onApply?.();
                                                setOpen(false);
                                            }}
                                            disabled={invalid}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${invalid ? 'bg-gray-100 text-gray-400' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                                        >
                                            <Check className="w-3 h-3" /> Áp dụng
                                        </button>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EndDatePicker;
