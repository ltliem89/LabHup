import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  isSelected?: boolean;
  onSelect: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, isSelected = false, onSelect }) => {
  return (
    <button
      id={`room-card-${room.id}`}
      onClick={() => onSelect(room)}
      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 bg-white ${
        isSelected
          ? 'border-[#1677FF] ring-2 ring-[#1677FF]/20 shadow-sm bg-[#EAF3FF]'
          : 'border-[#D9E2F0] hover:border-[#1677FF] hover:shadow-xs active:bg-[#F7F9FC]'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-13 h-13 rounded-xl bg-[#F0F5FF] text-[24px] flex items-center justify-center border border-[#D9E2F0] shrink-0">
          {room.icon}
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-[#172033] leading-snug">
            {room.name}
          </h3>
          <p className="text-[13px] text-[#667085] mt-0.5">
            Bấm để chọn phòng thực hành
          </p>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#667085] shrink-0">
        <ChevronRight className="w-5 h-5 text-[#667085]" />
      </div>
    </button>
  );
};
