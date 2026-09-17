import React from 'react';
import { AppHeader } from '../components/AppHeader';
import { ChapterCard } from '../components/ChapterCard';
import { Chapter, Room } from '../types';
import { CHAPTERS_DATA } from '../data/chapters';

interface ChapterScreenProps {
  room: Room;
  selectedSubject: string;
  selectedClass: string;
  onSelectChapter: (chap: Chapter) => void;
  onBack: () => void;
}

export const ChapterScreen: React.FC<ChapterScreenProps> = ({
  room,
  selectedSubject,
  selectedClass,
  onSelectChapter,
  onBack,
}) => {
  return (
    <div id="chapter-screen" className="min-h-full flex flex-col bg-[#F7F9FC]">
      <AppHeader
        title={`${selectedSubject} ${selectedClass}`}
        showBack={true}
        onBack={onBack}
      />

      {/* Compact context line right below header */}
      <div className="bg-[#EAF3FF] border-b border-[#D9E2F0] px-4 py-2 flex items-center justify-between text-[13px] text-[#1677FF] font-medium shrink-0">
        <div className="flex items-center gap-2">
          <span>{room.icon} {selectedSubject}</span>
          <span className="text-[#667085]">·</span>
          <span>🎓 Lớp {selectedClass}</span>
        </div>
        <span className="text-[12px] text-[#667085]">5 chương</span>
      </div>

      <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full overflow-y-auto">
        <div className="mb-3">
          <h2 className="text-[17px] font-bold text-[#172033]">
            Chọn chủ đề / Chương
          </h2>
          <p className="text-[13px] text-[#667085]">
            Vui lòng chọn chương để xem danh sách bài học
          </p>
        </div>

        {/* Vertical list of chapters */}
        <div className="space-y-2.5 pb-6">
          {CHAPTERS_DATA.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              onSelect={onSelectChapter}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
