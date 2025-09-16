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

// Format display dd/mm/yyyy from yyyy-mm-dd
const fmtDDMM = (s) => {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};

const DateRangeFilter = ({ start, end, onChange, onApply, onClear, invalid }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const range = useMemo(() => ({ from: toDate(start), to: toDate(end) }), [start, end]);

  const label = useMemo(() => {
    const s = fmtDDMM(start);
    const e = fmtDDMM(end);
    if (s && e) return `${s} → ${e}`;
    if (s) return `${s} → ...`;
    if (e) return `... → ${e}`;
    return 'Chọn khoảng thời gian';
  }, [start, end]);

  const handleSelect = (r) => {
    if (!r) {
      onChange('', '');
      return;
    }
    if (r.from && r.to) {
      onChange(fromDate(r.from), fromDate(r.to));
    } else if (r.from) {
      onChange(fromDate(r.from), '');
    } else {
      onChange('', '');
    }
  };

  return (
    <div className="relative" ref={ref}>
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
        <div className="absolute right-0 mt-2 w-[360px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={1}
            weekStartsOn={1}
            modifiersClassNames={{
              // Strong dashed red lines on top/bottom for the entire selected range
              selected:
                'relative before:content-["\""] before:absolute before:left-1 before:right-1 before:top-1 before:border-t-2 before:border-red-500 before:border-dashed after:content-["\""] after:absolute after:left-1 after:right-1 after:bottom-1 after:border-b-2 after:border-red-500 after:border-dashed',
              range_middle:
                'relative before:content-["\""] before:absolute before:left-1 before:right-1 before:top-1 before:border-t-2 before:border-red-500 before:border-dashed after:content-["\""] after:absolute after:left-1 after:right-1 after:bottom-1 after:border-b-2 after:border-red-500 after:border-dashed',
              // Fill only the start & end cells
              range_start:
                'relative bg-red-500 text-white before:content-["\""] before:absolute before:left-1 before:right-1 before:top-1 before:border-t-2 before:border-red-500 before:border-dashed after:content-["\""] after:absolute after:left-1 after:right-1 after:bottom-1 after:border-b-2 after:border-red-500 after:border-dashed',
              range_end:
                'relative bg-red-500 text-white before:content-["\""] before:absolute before:left-1 before:right-1 before:top-1 before:border-t-2 before:border-red-500 before:border-dashed after:content-["\""] after:absolute after:left-1 after:right-1 after:bottom-1 after:border-b-2 after:border-red-500 after:border-dashed',
              today: 'text-primary-600',
            }}
            styles={{
              day: { borderRadius: 10, width: 40, height: 36, fontSize: '14px' },
              head_cell: { color: '#6b7280', fontWeight: 600, fontSize: '12px' },
              caption_label: { fontSize: '16px', fontWeight: 700 },
              nav_button: { width: 36, height: 36 },
              nav_icon: { width: 18, height: 18 },
              // Keep middle transparent; selected covers single-day range
              day_selected: { backgroundColor: 'transparent', color: 'inherit' },
              day_range_middle: { backgroundColor: 'transparent', color: 'inherit' },
            }}
            footer={
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-gray-500">
                  {invalid ? 'Khoảng thời gian không hợp lệ' : 'Chọn ngày bắt đầu và kết thúc'}
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
      )}
    </div>
  );
};

export default DateRangeFilter;
