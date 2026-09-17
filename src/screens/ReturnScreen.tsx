import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { Receipt } from '../types';

interface ReturnScreenProps {
  receipt: Receipt;
  onConfirmReturn: (receiptId: string, returnedItemIds: string[]) => void;
  onBack: () => void;
}

export const ReturnScreen: React.FC<ReturnScreenProps> = ({
  receipt,
  onConfirmReturn,
  onBack,
}) => {
  // Default: all items are selected for return
  const [checkedIds, setCheckedIds] = useState<string[]>(
    receipt.items.map((i) => i.id)
  );

  const toggleItem = (id: string) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((itemId) => itemId !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const handleSelectAll = () => {
    setCheckedIds(receipt.items.map((i) => i.id));
  };

  const handleConfirm = () => {
    onConfirmReturn(receipt.id, checkedIds);
  };

  const isAllSelected = checkedIds.length === receipt.items.length;

  return (
    <div id="return-screen" className="min-h-full flex flex-col bg-[#F7F9FC]">
      <AppHeader
        title="Trả thiết bị"
        showBack={true}
        onBack={onBack}
      />

      <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full flex flex-col justify-between overflow-y-auto pb-24">
        <div className="space-y-4">
          {/* Thông tin phiếu */}
          <div className="bg-white p-4.5 rounded-2xl border border-[#D9E2F0] shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4FA]">
              <span className="text-[13px] text-[#667085]">Phiếu mượn</span>
              <span className="text-[16px] font-bold text-[#1677FF]">
                {receipt.id}
              </span>
            </div>

            <div className="text-[14px] space-y-1 text-[#172033]">
              <div className="flex justify-between">
                <span className="text-[#667085]">Phòng:</span>
                <span className="font-semibold">{receipt.roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Lớp:</span>
                <span className="font-semibold">{receipt.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Bài:</span>
                <span className="font-semibold text-right max-w-[210px] truncate">
                  {receipt.lessonTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Danh sách thiết bị cần trả */}
          <div className="bg-white p-4.5 rounded-2xl border border-[#D9E2F0] shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2F0]">
              <div>
                <h3 className="text-[14px] font-bold text-[#172033]">
                  Danh sách thiết bị hoàn trả
                </h3>
                <p className="text-[12px] text-[#667085]">
                  Mặc định: Tất cả được chọn
                </p>
              </div>

              {!isAllSelected && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[12px] text-[#1677FF] font-semibold hover:underline"
                >
                  Chọn tất cả
                </button>
              )}
            </div>

            <div className="divide-y divide-[#F0F4FA] mt-1">
              {receipt.items.map((item) => {
                const isChecked = checkedIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    id={`return-item-${item.id}`}
                    onClick={() => toggleItem(item.id)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#F7F9FC] px-1 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#1677FF] border-[#1677FF] text-white'
                            : 'bg-white border-[#D9E2F0]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="text-[15px] font-semibold text-[#172033]">
                        {item.name}
                      </div>
                    </div>

                    <div className="text-[14px] font-bold text-[#1677FF] px-2.5 py-1 bg-[#EAF3FF] rounded-lg">
                      × {item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <button
            id="confirm-return-btn"
            type="button"
            disabled={checkedIds.length === 0}
            onClick={handleConfirm}
            className="w-full h-12 bg-[#1677FF] hover:bg-[#0B2A5B] active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl font-semibold text-[15px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>XÁC NHẬN TRẢ TOÀN BỘ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
