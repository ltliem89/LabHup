import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ClassSelectorProps {
  classes: string[];
  selectedClass: string;
  onSelect: (cls: string) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes,
  selectedClass,
  onSelect,
}) => {
  return (
    <div className="w-full">
      <label htmlFor="class-select" className="block text-[13px] font-bold text-[#172033] uppercase tracking-wide mb-2">
        Lớp học
      </label>
      <div className="relative">
        <select
          id="class-select"
          value={selectedClass}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full h-12 pl-4 pr-10 bg-white border border-[#D9E2F0] rounded-xl text-[15px] font-medium text-[#172033] appearance-none focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/15 transition-all shadow-2xs"
        >
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              🎓 Lớp {cls}
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
