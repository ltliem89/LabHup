import React from 'react';

interface StatusBadgeProps {
  status: 'borrowing' | 'returned' | 'unavailable' | 'available';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  switch (status) {
    case 'borrowing':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#EAF9F0] text-[#22C55E] border border-[#22C55E]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          {label || 'Đang mượn'}
        </span>
      );
    case 'returned':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#F7F9FC] text-[#667085] border border-[#D9E2F0]">
          ✓ {label || 'Đã trả'}
        </span>
      );
    case 'unavailable':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FEF0F0] text-[#EF4444] border border-[#EF4444]/20">
          {label || 'Hết thiết bị'}
        </span>
      );
    case 'available':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EAF9F0] text-[#22C55E] border border-[#22C55E]/20">
          {label || 'Có sẵn'}
        </span>
      );
    default:
      return null;
  }
};
