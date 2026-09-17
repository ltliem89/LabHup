import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppHeader } from '../components/AppHeader';
import { Room } from '../types';

interface RoomScreenProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onLogout: () => void;
  selectedRoomId?: string;
}

export const RoomScreen: React.FC<RoomScreenProps> = ({
  rooms,
  onSelectRoom,
  onLogout,
  selectedRoomId,
}) => {
  const [chosenRoom, setChosenRoom] = useState<Room | null>(null);

  const handleRoomClick = (room: Room) => {
    setChosenRoom(room);
    // 200-300ms fade+slide before transition to SCREEN 03
    setTimeout(() => {
      onSelectRoom(room);
    }, 280);
  };

  return (
    <div id="room-screen" className="min-h-full flex flex-col bg-[#F7F9FC]">
      <AppHeader
        title="Chọn phòng"
        showBack={true}
        onBack={onLogout}
      />

      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full">
        {/* Header titles */}
        <div className="mb-5">
          <h2 className="text-[20px] font-bold text-[#172033]">
            Chọn phòng
          </h2>
          <p className="text-[14px] text-[#667085] mt-1">
            Vui lòng chọn phòng thực hành
          </p>
        </div>

        {/* 4 room cards in single column */}
        <div className="space-y-3">
          <AnimatePresence>
            {rooms.map((room) => {
              // If a room is clicked, only keep the selected room, other rooms vanish!
              if (chosenRoom && chosenRoom.id !== room.id) {
                return null;
              }

              const isSelected = (chosenRoom && chosenRoom.id === room.id) || selectedRoomId === room.id;

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isSelected && chosenRoom ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    id={`room-btn-${room.id}`}
                    onClick={() => handleRoomClick(room)}
                    className={`w-full p-4.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-[#EAF3FF] border-[#1677FF] ring-2 ring-[#1677FF]/25 shadow-md'
                        : 'bg-white border-[#D9E2F0] hover:border-[#1677FF] active:bg-[#F7F9FC]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-xl bg-[#F0F5FF] text-[26px] flex items-center justify-center border border-[#D9E2F0] shrink-0 shadow-2xs">
                        {room.icon}
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-[#172033]">
                          {room.name}
                        </h3>
                        <p className="text-[13px] text-[#667085] mt-0.5">
                          {isSelected ? 'Đang mở phòng...' : 'Nhấn để tiếp tục'}
                        </p>
                      </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSelected ? 'text-[#1677FF] bg-white' : 'text-[#667085]'
                    }`}>
                      →
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
