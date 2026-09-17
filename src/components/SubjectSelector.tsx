import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SubjectSelectorProps {
  subjects: string[];
  selectedSubject: string;
  onSelect: (subj: string) => void;
  roomIcon?: string;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  selectedSubject,
  onSelect,
  roomIcon = '⚡',
}) => {
  return (
    <div className="w-full">
      <label htmlFor="subject-select" className="block text-[13px] font-bold text-[#172033] uppercase tracking-wide mb-2">
        Môn học
      </label>
      <div className="relative">
        <select
          id="subject-select"
          value={selectedSubject}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full h-12 pl-4 pr-10 bg-white border border-[#D9E2F0] rounded-xl text-[15px] font-medium text-[#172033] appearance-none focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/15 transition-all shadow-2xs"
        >
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {roomIcon} {subj}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#667085]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
