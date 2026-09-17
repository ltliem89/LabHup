import React from 'react';

interface ContextBarProps {
  roomName?: string;
  subjectName: string;
  className: string;
  chapterCode: string;
  lessonName: string;
}

export const ContextBar: React.FC<ContextBarProps> = ({
  subjectName,
  className,
  chapterCode,
  lessonName,
}) => {
  return (
    <div
      id="context-bar"
      className="h-[34px] w-full bg-[#EAF3FF] border-b border-[#D9E2F0] px-4 flex items-center shrink-0"
    >
      <div className="text-[13px] font-medium text-[#1677FF] truncate flex items-center gap-1.5">
        <span>{subjectName}</span>
        <span className="text-[#667085]">·</span>
        <span>{className}</span>
        <span className="text-[#667085]">·</span>
        <span>{chapterCode}</span>
        <span className="text-[#667085]">·</span>
        <span className="text-[#172033] font-semibold truncate">{lessonName}</span>
      </div>
    </div>
  );
};
