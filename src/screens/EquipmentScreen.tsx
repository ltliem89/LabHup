import React, { useState, useMemo } from 'react';
import { AppHeader } from '../components/AppHeader';
import { ContextBar } from '../components/ContextBar';
import { SearchBar } from '../components/SearchBar';
import { EquipmentRow } from '../components/EquipmentRow';
import { BottomActionBar } from '../components/BottomActionBar';
import { Chapter, Equipment, Lesson, Room, SelectedItem } from '../types';

interface EquipmentScreenProps {
  room: Room;
  selectedSubject: string;
  selectedClass: string;
  selectedChapter: Chapter;
  selectedLesson: Lesson;
  inventory: Equipment[];
  selectedEquipment: SelectedItem[];
  onToggleEquipment: (equipmentId: string) => void;
  onUpdateQuantity: (equipmentId: string, quantity: number) => void;
  onProceedToConfirm: () => void;
  onBack: () => void;
  onHome: () => void;
}

export const EquipmentScreen: React.FC<EquipmentScreenProps> = ({
  room,
  selectedSubject,
  selectedClass,
  selectedChapter,
  selectedLesson,
  inventory,
  selectedEquipment,
  onToggleEquipment,
  onUpdateQuantity,
  onProceedToConfirm,
  onBack,
  onHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Selected map for quick lookup
  const selectedMap = useMemo(() => {
    const map = new Map<string, number>();
    selectedEquipment.forEach((item) => {
      map.set(item.id, item.quantity);
    });
    return map;
  }, [selectedEquipment]);

  // Filtered equipment list
  const filteredEquipment = useMemo(() => {
    return inventory.filter((eq) => {
      const matchSearch =
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (showOnlyAvailable && eq.availableQuantity === 0) return false;

      return true;
    });
  }, [inventory, searchQuery, showOnlyAvailable]);

  // Counts for bottom action bar
  const typesCount = selectedEquipment.length;
  const totalItems = selectedEquipment.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div id="equipment-screen" className="h-full flex flex-col bg-[#F7F9FC] overflow-hidden">
      {/* 6.1 Header cực gọn (48-52px) */}
      <AppHeader
        title={`Bài ${selectedLesson.number} – ${selectedLesson.title}`}
        showBack={true}
        onBack={onBack}
        showHome={true}
        onHome={onHome}
        isCompact={true}
      />

      {/* 6.2 Context Bar siêu gọn (32-36px) */}
      <ContextBar
        roomName={room.name}
        subjectName={selectedSubject}
        className={selectedClass}
        chapterCode={selectedChapter.code}
        lessonName={`Bài ${selectedLesson.number}`}
      />

      {/* 6.3 Thanh tìm kiếm (~44px) */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onToggleFilter={() => setShowOnlyAvailable(!showOnlyAvailable)}
        isFilterActive={showOnlyAvailable}
      />

      {/* Optional filter badge indicator if active */}
      {showOnlyAvailable && (
        <div className="bg-[#EAF3FF] px-4 py-1.5 flex items-center justify-between border-b border-[#D9E2F0] text-[12px] text-[#1677FF]">
          <span>Đang lọc: Chỉ hiển thị thiết bị còn hàng</span>
          <button
            onClick={() => setShowOnlyAvailable(false)}
            className="font-semibold underline hover:text-[#0B2A5B]"
          >
            Bỏ lọc
          </button>
        </div>
      )}

      {/* 6.4 DANH SÁCH THIẾT BỊ (80–90% diện tích màn hình, cuộn dọc 1 cột) */}
      <div
        id="equipment-scroll-list"
        className="flex-1 overflow-y-auto divide-y divide-[#D9E2F0] pb-28"
      >
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((equipment) => {
            const isSelected = selectedMap.has(equipment.id);
            const currentQty = selectedMap.get(equipment.id) || 0;

            return (
              <EquipmentRow
                key={equipment.id}
                equipment={equipment}
                isSelected={isSelected}
                selectedQuantity={currentQty}
                onToggleSelect={() => onToggleEquipment(equipment.id)}
                onQuantityChange={(qty) => onUpdateQuantity(equipment.id, qty)}
              />
            );
          })
        ) : (
          <div className="py-12 text-center text-[#667085] px-4">
            <p className="text-[15px] font-medium">Không tìm thấy thiết bị nào</p>
            <p className="text-[13px] mt-1">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>

      {/* 6.9 Fixed Bottom Action Bar */}
      <BottomActionBar
        typesCount={typesCount}
        totalItems={totalItems}
        onConfirm={onProceedToConfirm}
        visible={typesCount > 0}
      />
    </div>
  );
};
