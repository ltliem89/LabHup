import React from 'react';
import { ArrowLeft, MoreVertical, Home } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  showHome?: boolean;
  onHome?: () => void;
  rightAction?: React.ReactNode;
  isCompact?: boolean; // For Screen 06: 48-52px
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onBack,
  showBack = true,
  showHome = false,
  onHome,
  rightAction,
  isCompact = false,
}) => {
  return (
    <header
      id="app-header"
      className={`w-full bg-white border-b border-[#D9E2F0] flex items-center justify-between px-3 sticky top-0 z-30 transition-all ${
        isCompact ? 'h-[50px]' : 'h-[56px]'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {showBack && onBack ? (
          <button
            id="header-back-btn"
            onClick={onBack}
            aria-label="Quay lại"
            className="w-11 h-11 flex items-center justify-center rounded-xl text-[#172033] hover:bg-[#F7F9FC] active:bg-[#EAF3FF] active:text-[#1677FF] transition-colors -ml-1 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-2" />
        )}
        <h1
          id="header-title"
          className={`font-bold text-[#172033] truncate ${
            isCompact ? 'text-[17px]' : 'text-[19px]'
          }`}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center shrink-0">
        {showHome && onHome && (
          <button
            id="header-home-btn"
            onClick={onHome}
            aria-label="Trang chủ"
            className="w-11 h-11 flex items-center justify-center rounded-xl text-[#172033] hover:bg-[#F7F9FC] active:bg-[#EAF3FF] active:text-[#1677FF] transition-colors"
          >
            <Home className="w-5 h-5 text-[#172033]" />
          </button>
        )}

        {rightAction ? (
          rightAction
        ) : (
          !showHome && (
            <button
              id="header-more-btn"
              aria-label="Tùy chọn"
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#667085] hover:bg-[#F7F9FC] active:bg-[#EAF3FF] transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          )
        )}
      </div>
    </header>
  );
};
