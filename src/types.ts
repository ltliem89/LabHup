export interface Room {
  id: string;
  name: string;
  icon: string;
}

export interface Chapter {
  id: string;
  code: string;
  name: string;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  chapterId: string;
  number: number;
  title: string;
}

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  image?: string;
  status: 'available' | 'unavailable';
}

export interface SelectedItem {
  id: string;
  quantity: number;
}

export interface ReceiptItem {
  id: string;
  code: string;
  name: string;
  quantity: number;
  image?: string;
}

export interface Receipt {
  id: string;
  createdAt: string;
  roomName: string;
  subjectName: string;
  className: string;
  chapterName: string;
  lessonTitle: string;
  items: ReceiptItem[];
  note?: string;
  status: 'borrowing' | 'returned';
  returnedAt?: string;
}

export type ScreenId =
  | 'LOGIN'
  | 'ROOM'
  | 'SUBJECT_CLASS'
  | 'CHAPTER'
  | 'LESSON'
  | 'EQUIPMENT'
  | 'BORROW_CONFIRM'
  | 'BORROW_SUCCESS'
  | 'BORROW_RECEIPT'
  | 'RETURN';
