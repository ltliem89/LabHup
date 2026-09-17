import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Lesson } from '../types';

interface LessonRowProps {
  lesson: Lesson;
  onSelect: (lesson: Lesson) => void;
}

export const LessonRow: React.FC<LessonRowProps> = ({ lesson, onSelect }) => {
  return (
    <button
      id={`lesson-row-${lesson.id}`}
      onClick={() => onSelect(lesson)}
      className="w-full bg-white border border-[#D9E2F0] hover:border-[#1677FF] rounded-xl p-3.5 flex items-center justify-between transition-all text-left active:bg-[#F0F5FF] shadow-2xs"
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="text-[12px] font-semibold text-[#1677FF] mb-0.5">
          Bài {lesson.number}
        </div>
        <div className="text-[15px] font-semibold text-[#172033] truncate">
          {lesson.title}
        </div>
      </div>

      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#667085] shrink-0">
        <ChevronRight className="w-4 h-4 text-[#667085]" />
      </div>
    </button>
  );
};
