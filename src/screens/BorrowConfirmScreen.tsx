import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { Chapter, Equipment, Lesson, Room, SelectedItem } from '../types';

interface BorrowConfirmScreenProps {
  room: Room;
  selectedSubject: string;
  selectedClass: string;
  selectedChapter: Chapter;
  selectedLesson: Lesson;
  selectedEquipment: SelectedItem[];
  inventory: Equipment[];
  onConfirmBorrow: (note: string) => void;
  onCancel: () => void;
}

export const BorrowConfirmScreen: React.FC<BorrowConfirmScreenProps> = ({
  room,
  selectedSubject,
  selectedClass,
  selectedChapter,
  selectedLesson,
  selectedEquipment,
  inventory,
  onConfirmBorrow,
  onCancel,
}) => {
  const [note, setNote] = useState('');

  // Map selected equipment to full data
  const selectedItemsData = selectedEquipment.map((item) => {
    const eq = inventory.find((e) => e.id === item.id);
    return {
      id: item.id,
      code: eq?.code || item.id,
      name: eq?.name || 'Thiết bị',
      quantity: item.quantity,
      image: eq?.image,
    };
  });

  const totalQuantity = selectedEquipment.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div id="borrow-confirm-screen" className="min-h-full flex flex-col bg-[#F7F9FC]">
      <AppHeader
        title="Xác nhận mượn"
        showBack={true}
        onBack={onCancel}
      />

      <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full flex flex-col justify-between overflow-y-auto pb-24">
        <div className="space-y-4">
          {/* Thông tin mượn compact */}
          <div className="bg-white p-4 rounded-2xl border border-[#D9E2F0] shadow-2xs space-y-2.5">
            <h3 className="text-[14px] font-bold text-[#667085] uppercase tracking-wider mb-1">
              Thông tin buổi thực hành
            </h3>
            <div className="text-[14px] space-y-1.5 text-[#172033]">
              <div className="flex items-center gap-2">
                <span className="w-5 text-center">{room.icon}</span>
                <span className="font-semibold">{room.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-[#1677FF]">⚡</span>
                <span>Môn: <strong>{selectedSubject}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 text-center">🎓</span>
                <span>Lớp: <strong>{selectedClass}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 text-center">📚</span>
                <span>{selectedChapter.code} – {selectedChapter.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 text-center">📖</span>
                <span className="font-semibold text-[#1677FF]">
                  Bài {selectedLesson.number} – {selectedLesson.title}
                </span>
              </div>
            </div>
          </div>

          {/* Thiết bị đã chọn */}
          <div className="bg-white p-4 rounded-2xl border border-[#D9E2F0] shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9E2F0]">
              <h3 className="text-[14px] font-bold text-[#667085] uppercase tracking-wider">
                Thiết bị đã chọn ({selectedEquipment.length})
              </h3>
              <span className="text-[13px] font-semibold text-[#1677FF]">
                Tổng: {totalQuantity} cái
              </span>
            </div>

            <div className="divide-y divide-[#F0F4FA] mt-1">
              {selectedItemsData.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F7F9FC] border border-[#D9E2F0] overflow-hidden flex items-center justify-center shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[12px] text-[#667085]">🧪</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#172033]">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#667085]">
                        Mã: {item.code}
                      </div>
                    </div>
                  </div>

                  <div className="text-[15px] font-bold text-[#1677FF] px-2.5 py-1 bg-[#EAF3FF] rounded-lg">
                    × {item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          <div className="bg-white p-4 rounded-2xl border border-[#D9E2F0] shadow-2xs">
            <label
              htmlFor="borrow-note-input"
              className="block text-[13px] font-semibold text-[#172033] mb-1.5"
            >
              Ghi chú (nếu có)
            </label>
            <input
              id="borrow-note-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú cho cán bộ thiết bị..."
              className="w-full h-11 px-3.5 bg-[#F7F9FC] border border-[#D9E2F0] rounded-xl text-[14px] text-[#172033] placeholder-[#667085] focus:outline-none focus:border-[#1677FF] focus:bg-white focus:ring-2 focus:ring-[#1677FF]/15 transition-all"
            />
          </div>
        </div>

        {/* Buttons at bottom */}
        <div className="pt-6 grid grid-cols-2 gap-3">
          <button
            id="borrow-cancel-btn"
            type="button"
            onClick={onCancel}
            className="h-12 bg-white hover:bg-[#F7F9FC] active:bg-[#EAF3FF] text-[#667085] border border-[#D9E2F0] rounded-xl font-semibold text-[15px] transition-all cursor-pointer"
          >
            HỦY
          </button>

          <button
            id="borrow-submit-confirm-btn"
            type="button"
            onClick={() => onConfirmBorrow(note)}
            className="h-12 bg-[#1677FF] hover:bg-[#0B2A5B] active:scale-[0.99] text-white rounded-xl font-semibold text-[15px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            XÁC NHẬN MƯỢN
          </button>
        </div>
      </div>
    </div>
  );
};
