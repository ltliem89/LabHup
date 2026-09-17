import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { SubjectSelector } from '../components/SubjectSelector';
import { ClassSelector } from '../components/ClassSelector';
import { Room } from '../types';
import { SUBJECTS_DATA } from '../data/subjects';
import { CLASSES_DATA } from '../data/classes';

interface SubjectClassScreenProps {
  room: Room;
  selectedSubject: string;
  selectedClass: string;
  onSubjectChange: (subj: string) => void;
  onClassChange: (cls: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SubjectClassScreen: React.FC<SubjectClassScreenProps> = ({
  room,
  selectedSubject,
  selectedClass,
  onSubjectChange,
  onClassChange,
  onNext,
  onBack,
}) => {
  return (
    <div id="subject-class-screen" className="min-h-full flex flex-col bg-[#F7F9FC]">
      <AppHeader
        title={`${room.icon} ${room.name}`}
        showBack={true}
        onBack={onBack}
      />

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full flex flex-col justify-between">
        <div className="space-y-6">
          <div className="bg-white p-4.5 rounded-2xl border border-[#D9E2F0] shadow-xs space-y-5">
            <div>
              <h2 className="text-[18px] font-bold text-[#172033]">
                Thông tin giảng dạy
              </h2>
              <p className="text-[13px] text-[#667085] mt-0.5">
                Vui lòng chọn môn và lớp cần thực hành
              </p>
            </div>

            {/* Subject Selector */}
            <SubjectSelector
              subjects={SUBJECTS_DATA}
              selectedSubject={selectedSubject}
              onSelect={onSubjectChange}
              roomIcon={room.icon}
            />

            {/* Class Selector */}
            <ClassSelector
              classes={CLASSES_DATA}
              selectedClass={selectedClass}
              onSelect={onClassChange}
            />
          </div>

          {/* Current Selection summary card */}
          <div className="p-4 rounded-xl bg-[#EAF3FF] border border-[#1677FF]/20 flex items-center justify-between">
            <span className="text-[13px] text-[#667085] font-medium">Đang chọn:</span>
            <div className="flex items-center gap-2 font-bold text-[14px] text-[#1677FF]">
              <span>{room.icon} {selectedSubject}</span>
              <span className="text-[#667085]">·</span>
              <span>🎓 Lớp {selectedClass}</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-6 pb-2">
          <button
            id="subject-class-next-btn"
            onClick={onNext}
            className="w-full h-12 bg-[#1677FF] hover:bg-[#0B2A5B] active:scale-[0.99] text-white rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>TIẾP TỤC CHỌN CHƯƠNG</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
