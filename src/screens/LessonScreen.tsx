import React from 'react';
import { AppHeader } from '../components/AppHeader';
import { LessonRow } from '../components/LessonRow';
import { Chapter, Lesson, Room } from '../types';
import { LESSONS_DATA } from '../data/lessons';

interface LessonScreenProps {
  room: Room;
  lessons: Lesson[];
  selectedSubject: string;
  selectedClass: string;
  selectedChapter: Chapter;
  onSelectLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
  lessons,
  selectedSubject,
  selectedClass,
  selectedChapter,
  onSelectLesson,
  onBack,
}) => {
  // Filter lessons for this chapter (or show all available lessons for C1)
  const filteredLessons = lessons.filter(
    (l) => l.chapterId === selectedChapter.id || selectedChapter.id === 'C1'
  );

  return (
    <div id="lesson-screen" className="min-h-full flex flex-col bg-[#F7F9FC]">
      <AppHeader
        title={`${selectedChapter.code} – ${selectedChapter.name}`}
        showBack={true}
        onBack={onBack}
      />

      {/* Small breadcrumb below header */}
      <div className="bg-[#EAF3FF] border-b border-[#D9E2F0] px-4 py-2 flex items-center text-[13px] text-[#1677FF] font-medium shrink-0">
        <span>{selectedSubject}</span>
        <span className="mx-2 text-[#667085]">|</span>
        <span>{selectedClass}</span>
        <span className="mx-2 text-[#667085]">|</span>
        <span className="font-semibold text-[#172033]">{selectedChapter.code}</span>
      </div>

      <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full overflow-y-auto">
        <div className="mb-3">
          <h2 className="text-[17px] font-bold text-[#172033]">
            Chọn bài học
          </h2>
          <p className="text-[13px] text-[#667085]">
            Chọn bài để lấy danh sách thiết bị thực hành
          </p>
        </div>

        {/* 1 column list of lessons */}
        <div className="space-y-2 pb-6">
          {filteredLessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              onSelect={onSelectLesson}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
