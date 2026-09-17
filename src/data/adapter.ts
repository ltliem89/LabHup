import { api } from '../api';
import { Room, Chapter, Lesson, Equipment, Receipt, ReceiptItem } from '../types';

export const loadAppData = async () => {
  const data = await api.bootstrap();
  
  const rooms: Room[] = (data.rooms || []).map((r: any) => ({
    id: r.room_id,
    name: r.room_name,
    icon: r.room_code || '🧪' // Use room_code as icon fallback
  }));

  const chapters: Chapter[] = (data.topics || []).map((t: any) => {
    const topicLessons = (data.lessons || []).filter((l: any) => l.topic_id === t.topic_id);
    return {
      id: t.topic_id,
      code: t.topic_code,
      name: t.topic_name,
      lessonCount: topicLessons.length
    };
  });

  const lessons: Lesson[] = (data.lessons || []).map((l: any) => ({
    id: l.lesson_id,
    chapterId: l.topic_id,
    number: Number(l.lesson_no) || 1,
    title: l.lesson_name
  }));

  const equipment: Equipment[] = (data.inventory || []).map((e: any) => ({
    id: e.equipment_id,
    code: e.equipment_code,
    name: e.equipment_name,
    category: e.category,
    totalQuantity: Number(e.total_quantity) || 0,
    availableQuantity: Number(e.available) || 0,
    image: e.image_url || undefined,
    status: Number(e.available) > 0 ? 'available' : 'unavailable'
  }));

  return { rooms, chapters, lessons, equipment, rawData: data };
};

export const loadMyReceipts = async () => {
  try {
    const data = await api.myBorrows();
    return (data || []).map((b: any) => ({
      id: b.borrow_id,
      createdAt: new Date(b.borrowed_at).toLocaleString('vi-VN'),
      roomName: b.room_id, // we might need to map ID to name in UI
      subjectName: b.subject_id,
      className: b.class_id,
      chapterName: b.topic_id,
      lessonTitle: b.lesson_id,
      items: (b.items || []).map((i: any) => ({
        id: i.equipment_id,
        code: i.equipment_id, // we might not have code here unless we lookup
        name: i.equipment_id,
        quantity: Number(i.quantity) || 0
      })),
      note: b.note,
      status: b.status === 'RETURNED' ? 'returned' : 'borrowing',
      returnedAt: b.returned_at ? new Date(b.returned_at).toLocaleString('vi-VN') : undefined
    } as Receipt));
  } catch (err) {
    console.error('Failed to load receipts', err);
    return [];
  }
};
