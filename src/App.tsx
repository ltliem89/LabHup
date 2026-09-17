import React, { useState } from 'react';
import { ScreenId, Room, Chapter, Lesson, SelectedItem, Receipt, Equipment } from './types';
import { ROOMS_DATA } from './data/rooms';
import { CHAPTERS_DATA } from './data/chapters';
import { LESSONS_DATA } from './data/lessons';
import { INITIAL_EQUIPMENT_DATA } from './data/equipment';

import { LoginScreen } from './screens/LoginScreen';
import { RoomScreen } from './screens/RoomScreen';
import { SubjectClassScreen } from './screens/SubjectClassScreen';
import { ChapterScreen } from './screens/ChapterScreen';
import { LessonScreen } from './screens/LessonScreen';
import { EquipmentScreen } from './screens/EquipmentScreen';
import { BorrowConfirmScreen } from './screens/BorrowConfirmScreen';
import { BorrowSuccessScreen } from './screens/BorrowSuccessScreen';
import { BorrowReceiptScreen } from './screens/BorrowReceiptScreen';
import { ReturnScreen } from './screens/ReturnScreen';

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('LOGIN');

  // Selected state
  const [selectedRoom, setSelectedRoom] = useState<Room>(ROOMS_DATA[0]);
  const [selectedSubject, setSelectedSubject] = useState<string>('Vật lý');
  const [selectedClass, setSelectedClass] = useState<string>('8A1');
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(CHAPTERS_DATA[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(LESSONS_DATA[1]); // Default Bài 2 - Đo khối lượng

  // Equipment Inventory State (with mutable availableQuantity)
  const [inventory, setInventory] = useState<Equipment[]>(INITIAL_EQUIPMENT_DATA);

  // Selected Equipment in active borrowing session
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedItem[]>([]);

  // Receipts State (includes the demo receipt from spec BR-000125)
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: 'BR-000125',
      createdAt: '17/09/2026 08:15',
      roomName: 'Phòng Vật lý',
      subjectName: 'Vật lý',
      className: '8A1',
      chapterName: 'C1 – Cơ học',
      lessonTitle: 'Bài 2 – Đo khối lượng',
      items: [
        {
          id: 'EQ001',
          code: 'EQ001',
          name: 'Cân điện tử',
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=160&auto=format&fit=crop&q=80',
        },
        {
          id: 'EQ003',
          code: 'EQ003',
          name: 'Quả cân 100g',
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=160&auto=format&fit=crop&q=80',
        },
      ],
      note: 'Thí nghiệm đo khối lượng tiết 2',
      status: 'borrowing',
    },
  ]);

  // Active receipt for success or return screen
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  // Receipt tab default
  const [receiptTabDefault, setReceiptTabDefault] = useState<'borrowing' | 'returned'>('borrowing');

  // HANDLERS

  // Login
  const handleLoginSuccess = () => {
    setCurrentScreen('ROOM');
  };

  // Room Selection
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    // Automatically match primary subject if needed, or keep previous
    if (room.id === 'PHY') setSelectedSubject('Vật lý');
    else if (room.id === 'CHEM_BIO') setSelectedSubject('Hóa học');
    else if (room.id === 'STEM') setSelectedSubject('STEM');
    else if (room.id === 'ROBOT') setSelectedSubject('Robotics');

    setCurrentScreen('SUBJECT_CLASS');
  };

  // Subject & Class Selection
  const handleSubjectClassNext = () => {
    setCurrentScreen('CHAPTER');
  };

  // Chapter Selection
  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setCurrentScreen('LESSON');
  };

  // Lesson Selection
  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentScreen('EQUIPMENT');
  };

  // Equipment Toggle
  const handleToggleEquipment = (equipmentId: string) => {
    setSelectedEquipment((prev) => {
      const exists = prev.find((item) => item.id === equipmentId);
      if (exists) {
        return prev.filter((item) => item.id !== equipmentId);
      } else {
        return [...prev, { id: equipmentId, quantity: 1 }];
      }
    });
  };

  // Equipment Quantity Change
  const handleUpdateQuantity = (equipmentId: string, quantity: number) => {
    if (quantity <= 0) {
      handleToggleEquipment(equipmentId);
      return;
    }

    const eq = inventory.find((e) => e.id === equipmentId);
    if (!eq) return;

    // Respect max available quantity
    const finalQty = Math.min(quantity, eq.availableQuantity);

    setSelectedEquipment((prev) => {
      const exists = prev.find((item) => item.id === equipmentId);
      if (exists) {
        return prev.map((item) =>
          item.id === equipmentId ? { ...item, quantity: finalQty } : item
        );
      } else {
        return [...prev, { id: equipmentId, quantity: finalQty }];
      }
    });
  };

  // Confirm Borrow Action (Screen 07 -> 08)
  const handleConfirmBorrow = (note: string) => {
    const nextReceiptNum = receipts.length + 126;
    const newReceiptId = `BR-000${nextReceiptNum}`;

    // Get current time formatted
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Format items
    const receiptItems = selectedEquipment.map((item) => {
      const eq = inventory.find((e) => e.id === item.id);
      return {
        id: item.id,
        code: eq?.code || item.id,
        name: eq?.name || 'Thiết bị',
        quantity: item.quantity,
        image: eq?.image,
      };
    });

    const newReceipt: Receipt = {
      id: newReceiptId,
      createdAt: dateStr,
      roomName: selectedRoom.name,
      subjectName: selectedSubject,
      className: selectedClass,
      chapterName: `${selectedChapter.code} – ${selectedChapter.name}`,
      lessonTitle: `Bài ${selectedLesson.number} – ${selectedLesson.title}`,
      items: receiptItems,
      note: note.trim() || undefined,
      status: 'borrowing',
    };

    // Deduct availableQuantity from inventory (Section 11, 31)
    setInventory((prev) =>
      prev.map((eq) => {
        const borrowed = selectedEquipment.find((item) => item.id === eq.id);
        if (borrowed) {
          const newAvail = Math.max(0, eq.availableQuantity - borrowed.quantity);
          return {
            ...eq,
            availableQuantity: newAvail,
            status: newAvail === 0 ? 'unavailable' : 'available',
          };
        }
        return eq;
      })
    );

    // Save receipt & clear selected equipment
    setReceipts((prev) => [newReceipt, ...prev]);
    setActiveReceipt(newReceipt);
    setSelectedEquipment([]);

    // Move to Screen 08 (BorrowSuccessScreen)
    setCurrentScreen('BORROW_SUCCESS');
  };

  // Return Equipment Action (Screen 10 -> 09)
  const handleConfirmReturn = (receiptId: string, returnedItemIds: string[]) => {
    const targetReceipt = receipts.find((r) => r.id === receiptId);
    if (!targetReceipt) return;

    // Restore available quantities back into inventory
    setInventory((prev) =>
      prev.map((eq) => {
        const itemInReceipt = targetReceipt.items.find(
          (i) => i.id === eq.id && returnedItemIds.includes(i.id)
        );
        if (itemInReceipt) {
          const newAvail = Math.min(
            eq.totalQuantity,
            eq.availableQuantity + itemInReceipt.quantity
          );
          return {
            ...eq,
            availableQuantity: newAvail,
            status: newAvail > 0 ? 'available' : 'unavailable',
          };
        }
        return eq;
      })
    );

    const now = new Date();
    const returnTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    // Mark receipt as returned
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receiptId
          ? { ...r, status: 'returned', returnedAt: returnTimeStr }
          : r
      )
    );

    // Navigate to receipts screen on "Đã trả" tab
    setReceiptTabDefault('returned');
    setCurrentScreen('BORROW_RECEIPT');
  };

  return (
    <div className="min-h-screen bg-[#E5EAF2] flex items-center justify-center p-0 sm:py-6 sm:px-4">
      {/* Mobile-first frame container */}
      <div className="w-full sm:max-w-[400px] h-[100dvh] sm:h-[844px] bg-[#F7F9FC] sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden sm:border-[8px] sm:border-[#1E293B] relative">
        {/* iOS Dynamic Island / Speaker notch mockup for desktop view */}
        <div className="hidden sm:flex justify-center pt-2 pb-1 bg-white z-50 shrink-0">
          <div className="w-24 h-4 bg-[#1E293B] rounded-full" />
        </div>

        {/* Dynamic Screen rendering */}
        <div className="flex-1 overflow-hidden relative">
          {currentScreen === 'LOGIN' && (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )}

          {currentScreen === 'ROOM' && (
            <RoomScreen
              onSelectRoom={handleSelectRoom}
              onLogout={() => setCurrentScreen('LOGIN')}
              selectedRoomId={selectedRoom.id}
            />
          )}

          {currentScreen === 'SUBJECT_CLASS' && (
            <SubjectClassScreen
              room={selectedRoom}
              selectedSubject={selectedSubject}
              selectedClass={selectedClass}
              onSubjectChange={setSelectedSubject}
              onClassChange={setSelectedClass}
              onNext={handleSubjectClassNext}
              onBack={() => setCurrentScreen('ROOM')}
            />
          )}

          {currentScreen === 'CHAPTER' && (
            <ChapterScreen
              room={selectedRoom}
              selectedSubject={selectedSubject}
              selectedClass={selectedClass}
              onSelectChapter={handleSelectChapter}
              onBack={() => setCurrentScreen('SUBJECT_CLASS')}
            />
          )}

          {currentScreen === 'LESSON' && (
            <LessonScreen
              room={selectedRoom}
              selectedSubject={selectedSubject}
              selectedClass={selectedClass}
              selectedChapter={selectedChapter}
              onSelectLesson={handleSelectLesson}
              onBack={() => setCurrentScreen('CHAPTER')}
            />
          )}

          {currentScreen === 'EQUIPMENT' && (
            <EquipmentScreen
              room={selectedRoom}
              selectedSubject={selectedSubject}
              selectedClass={selectedClass}
              selectedChapter={selectedChapter}
              selectedLesson={selectedLesson}
              inventory={inventory}
              selectedEquipment={selectedEquipment}
              onToggleEquipment={handleToggleEquipment}
              onUpdateQuantity={handleUpdateQuantity}
              onProceedToConfirm={() => setCurrentScreen('BORROW_CONFIRM')}
              onBack={() => setCurrentScreen('LESSON')}
              onHome={() => setCurrentScreen('ROOM')}
            />
          )}

          {currentScreen === 'BORROW_CONFIRM' && (
            <BorrowConfirmScreen
              room={selectedRoom}
              selectedSubject={selectedSubject}
              selectedClass={selectedClass}
              selectedChapter={selectedChapter}
              selectedLesson={selectedLesson}
              selectedEquipment={selectedEquipment}
              inventory={inventory}
              onConfirmBorrow={handleConfirmBorrow}
              onCancel={() => setCurrentScreen('EQUIPMENT')}
            />
          )}

          {currentScreen === 'BORROW_SUCCESS' && activeReceipt && (
            <BorrowSuccessScreen
              receipt={activeReceipt}
              onViewReceipt={() => {
                setReceiptTabDefault('borrowing');
                setCurrentScreen('BORROW_RECEIPT');
              }}
              onGoHome={() => setCurrentScreen('ROOM')}
            />
          )}

          {currentScreen === 'BORROW_RECEIPT' && (
            <BorrowReceiptScreen
              receipts={receipts}
              activeTabDefault={receiptTabDefault}
              onSelectReturn={(receipt) => {
                setActiveReceipt(receipt);
                setCurrentScreen('RETURN');
              }}
              onBack={() => setCurrentScreen('ROOM')}
            />
          )}

          {currentScreen === 'RETURN' && activeReceipt && (
            <ReturnScreen
              receipt={activeReceipt}
              onConfirmReturn={handleConfirmReturn}
              onBack={() => setCurrentScreen('BORROW_RECEIPT')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
