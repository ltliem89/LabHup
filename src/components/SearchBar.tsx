import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onToggleFilter?: () => void;
  isFilterActive?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onToggleFilter,
  isFilterActive = false,
}) => {
  return (
    <div id="search-bar-container" className="px-3 py-1.5 bg-white border-b border-[#D9E2F0] shrink-0">
      <div className="flex items-center gap-2 h-[42px]">
        <div className="relative flex-1 h-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#667085]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="equipment-search-input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tìm thiết bị..."
            className="w-full h-full pl-9 pr-8 bg-[#F7F9FC] border border-[#D9E2F0] rounded-xl text-[14px] text-[#172033] placeholder-[#667085] focus:outline-none focus:border-[#1677FF] focus:bg-white transition-all"
          />
          {value && (
            <button
              id="equipment-search-clear"
              onClick={() => onChange('')}
              className="absolute inset-y-0 right-2 flex items-center pr-1 text-[#667085] hover:text-[#172033]"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          id="equipment-filter-btn"
          onClick={onToggleFilter}
          aria-label="Bộ lọc"
          className={`h-[42px] px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
            isFilterActive
              ? 'bg-[#EAF3FF] border-[#1677FF] text-[#1677FF]'
              : 'bg-[#F7F9FC] border-[#D9E2F0] text-[#667085] hover:bg-[#EAF3FF] hover:text-[#1677FF]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[13px] font-medium hidden sm:inline">Lọc</span>
        </button>
      </div>
    </div>
  );
};
