import React, { useState, useEffect } from 'react';
import { ScreenId, Room, Chapter, Lesson, SelectedItem, Receipt, Equipment } from './types';
import { ROOMS_DATA } from './data/rooms';
import { CHAPTERS_DATA } from './data/chapters';
import { LESSONS_DATA } from './data/lessons';
import { INITIAL_EQUIPMENT_DATA } from './data/equipment';
import { loadAppData, loadMyReceipts } from './data/adapter';

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
  // Data states
  const [rooms, setRooms] = useState<Room[]>(ROOMS_DATA);
  const [chapters, setChapters] = useState<Chapter[]>(CHAPTERS_DATA);
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS_DATA);
  const [inventory, setInventory] = useState<Equipment[]>(INITIAL_EQUIPMENT_DATA);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('LOGIN');

  // Selected state
  const [selectedRoom, setSelectedRoom] = useState<Room>(ROOMS_DATA[0]);
  const [selectedSubject, setSelectedSubject] = useState<string>('Vật lý');
  const [selectedClass, setSelectedClass] = useState<string>('8A1');
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(CHAPTERS_DATA[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(LESSONS_DATA[1]);

  // Selected Equipment in active borrowing session
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedItem[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const appData = await loadAppData();
        if (appData.rooms.length > 0) setRooms(appData.rooms);
        if (appData.chapters.length > 0) setChapters(appData.chapters);
        if (appData.lessons.length > 0) setLessons(appData.lessons);
        if (appData.equipment.length > 0) setInventory(appData.equipment);
        
        // Also set initial selections if data is present
        if (appData.rooms.length > 0) setSelectedRoom(appData.rooms[0]);
        if (appData.chapters.length > 0) setSelectedChapter(appData.chapters[0]);
        if (appData.lessons.length > 0) setSelectedLesson(appData.lessons[0]);
      } catch (e) {
        console.warn("Failed to load app data, falling back to local mocks");
      }
      try {
        const myReceipts = await loadMyReceipts();
        if (myReceipts.length > 0) setReceipts(myReceipts);
      } catch (e) {
        // Fallback or empty
      }
      setIsLoading(false);
    };
    init();
  }, []);

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
  const handleConfirmBorrow = async (note: string) => {
    // Generate an internal client_request_id for idempotency
    const clientRequestId = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const items = selectedEquipment.map((item) => ({
      equipment_id: item.id,
      quantity: item.quantity,
      note: ''
    }));

    setIsLoading(true);
    try {
      // Import api inside App or top level
      const { api } = await import('./api');
      const res = await api.borrow({
        client_request_id: clientRequestId,
        room_id: selectedRoom.id,
        subject_id: selectedSubject, // using name as id since our mock uses names
        class_id: selectedClass,
        topic_id: selectedChapter.id,
        lesson_id: selectedLesson.id,
        items,
        note
      });
      
      // reload data to get updated inventory and receipts
      const [appData, myReceipts] = await Promise.all([
        loadAppData(),
        loadMyReceipts()
      ]);
      if (appData.equipment.length > 0) setInventory(appData.equipment);
      if (myReceipts.length > 0) {
        setReceipts(myReceipts);
        // Find the newly created receipt (or fallback to the first one)
        const newReceipt = myReceipts.find((r: any) => r.id === res.borrow_id) || myReceipts[0];
        setActiveReceipt(newReceipt);
      }
      
      setSelectedEquipment([]);
      setCurrentScreen('BORROW_SUCCESS');
    } catch (e: any) {
      alert(`Lỗi mượn thiết bị: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Return Equipment Action (Screen 10 -> 09)
  const handleConfirmReturn = async (receiptId: string, returnedItemIds: string[]) => {
    setIsLoading(true);
    try {
      const { api } = await import('./api');
      await api.returnBorrow({ borrow_id: receiptId });
      
      const [appData, myReceipts] = await Promise.all([
        loadAppData(),
        loadMyReceipts()
      ]);
      if (appData.equipment.length > 0) setInventory(appData.equipment);
      if (myReceipts.length > 0) setReceipts(myReceipts);

      setReceiptTabDefault('returned');
      setCurrentScreen('BORROW_RECEIPT');
    } catch (e: any) {
      alert(`Lỗi trả thiết bị: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
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
              rooms={rooms}
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
              chapters={chapters}
              selectedSubject={selectedSubject}
              selectedClass={selectedClass}
              onSelectChapter={handleSelectChapter}
              onBack={() => setCurrentScreen('SUBJECT_CLASS')}
            />
          )}

          {currentScreen === 'LESSON' && (
            <LessonScreen
              room={selectedRoom}
              lessons={lessons}
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
