import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Receipt } from '../types';

interface BorrowReceiptScreenProps {
  receipts: Receipt[];
  onSelectReturn: (receipt: Receipt) => void;
  onBack: () => void;
  activeTabDefault?: 'borrowing' | 'returned';
}

export const BorrowReceiptScreen: React.FC<BorrowReceiptScreenProps> = ({
  receipts,
  onSelectReturn,
  onBack,
  activeTabDefault = 'borrowing',
}) => {
  const [activeTab, setActiveTab] = useState<'borrowing' | 'returned'>(activeTabDefault);

  const borrowingList = receipts.filter((r) => r.status === 'borrowing');
  const returnedList = receipts.filter((r) => r.status === 'returned');

  const currentList = activeTab === 'borrowing' ? borrowingList : returnedList;

  return (
    <div id="receipt-screen" className="min-h-full flex flex-col bg-[#F7F9FC]">
      <AppHeader
        title="Phiếu của tôi"
        showBack={true}
        onBack={onBack}
      />

      {/* Tabs */}
      <div className="bg-white border-b border-[#D9E2F0] px-4 flex">
        <button
          id="tab-borrowing"
          onClick={() => setActiveTab('borrowing')}
          className={`flex-1 py-3 text-center text-[14px] font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'borrowing'
              ? 'border-[#1677FF] text-[#1677FF]'
              : 'border-transparent text-[#667085] hover:text-[#172033]'
          }`}
        >
          Đang mượn ({borrowingList.length})
        </button>
        <button
          id="tab-returned"
          onClick={() => setActiveTab('returned')}
          className={`flex-1 py-3 text-center text-[14px] font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'returned'
              ? 'border-[#1677FF] text-[#1677FF]'
              : 'border-transparent text-[#667085] hover:text-[#172033]'
          }`}
        >
          Đã trả ({returnedList.length})
        </button>
      </div>

      <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full overflow-y-auto space-y-3 pb-8">
        {currentList.length > 0 ? (
          currentList.map((receipt) => {
            const totalItemsCount = receipt.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={receipt.id}
                id={`receipt-card-${receipt.id}`}
                className="bg-white rounded-2xl border border-[#D9E2F0] p-4.5 space-y-3.5 shadow-2xs"
              >
                {/* Header row */}
                <div className="flex items-center justify-between pb-2 border-b border-[#F0F4FA]">
                  <div>
                    <span className="text-[16px] font-bold text-[#172033] tracking-wide">
                      {receipt.id}
                    </span>
                    <div className="text-[12px] text-[#667085] mt-0.5">
                      {receipt.createdAt}
                    </div>
                  </div>
                  <StatusBadge status={receipt.status} />
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-[14px]">
                  <div className="font-semibold text-[#172033] flex items-center gap-1.5">
                    <span>{receipt.subjectName}</span>
                    <span className="text-[#667085]">·</span>
                    <span>Lớp {receipt.className}</span>
                  </div>

                  <div className="text-[#1677FF] font-medium text-[13px]">
                    {receipt.lessonTitle}
                  </div>

                  <div className="text-[13px] text-[#667085] pt-0.5">
                    {receipt.items.length} loại · {totalItemsCount} thiết bị
                  </div>

                  {receipt.note && (
                    <div className="text-[12px] text-[#667085] bg-[#F7F9FC] p-2 rounded-lg mt-1 italic">
                      &quot;{receipt.note}&quot;
                    </div>
                  )}
                </div>

                {/* Main Action Button */}
                {receipt.status === 'borrowing' ? (
                  <button
                    id={`return-btn-${receipt.id}`}
                    onClick={() => onSelectReturn(receipt)}
                    className="w-full h-12 bg-[#1677FF] hover:bg-[#0B2A5B] active:scale-[0.99] text-white rounded-xl font-semibold text-[15px] shadow-sm transition-all cursor-pointer flex items-center justify-center mt-2"
                  >
                    TRẢ THIẾT BỊ
                  </button>
                ) : (
                  <div className="text-[12px] text-[#667085] text-right font-medium pt-1">
                    Đã hoàn tất trả lúc {receipt.returnedAt || 'Hôm nay'}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-[#667085]">
            <p className="text-[15px] font-medium">
              {activeTab === 'borrowing'
                ? 'Không có phiếu nào đang mượn'
                : 'Chưa có phiếu nào đã trả'}
            </p>
            <p className="text-[13px] mt-1">
              {activeTab === 'borrowing'
                ? 'Hãy thực hiện mượn thiết bị mới'
                : 'Các phiếu sau khi trả sẽ hiển thị tại đây'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
