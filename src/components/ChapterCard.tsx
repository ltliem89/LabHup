import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Chapter } from '../types';

interface ChapterCardProps {
  chapter: Chapter;
  onSelect: (chapter: Chapter) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onSelect }) => {
  return (
    <button
      id={`chapter-card-${chapter.id}`}
      onClick={() => onSelect(chapter)}
      className="w-full bg-white border border-[#D9E2F0] hover:border-[#1677FF] rounded-xl p-4 flex items-center justify-between transition-all text-left active:bg-[#F0F5FF] shadow-2xs"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[#EAF3FF] text-[#1677FF] font-bold text-[14px] flex items-center justify-center shrink-0 border border-[#D9E2F0]">
          {chapter.code}
        </div>
        <div className="truncate">
          <h3 className="text-[16px] font-semibold text-[#172033] truncate">
            {chapter.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[13px] text-[#667085] font-medium">
          {chapter.lessonCount} bài
        </span>
        <ChevronRight className="w-4 h-4 text-[#667085]" />
      </div>
    </button>
  );
};
