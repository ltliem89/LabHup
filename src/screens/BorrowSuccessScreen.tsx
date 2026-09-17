import React from 'react';
import { Check } from 'lucide-react';
import { Receipt } from '../types';

interface BorrowSuccessScreenProps {
  receipt: Receipt;
  onViewReceipt: () => void;
  onGoHome: () => void;
}

export const BorrowSuccessScreen: React.FC<BorrowSuccessScreenProps> = ({
  receipt,
  onViewReceipt,
  onGoHome,
}) => {
  const totalItems = receipt.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div id="borrow-success-screen" className="min-h-full flex flex-col justify-between px-4 py-8 bg-white max-w-md mx-auto w-full">
      <div className="space-y-6 pt-4">
        {/* Success Icon & Title */}
        <div className="text-center">
          <div className="w-18 h-18 mx-auto rounded-full bg-[#EAF9F0] border-2 border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] mb-3.5 shadow-sm animate-scaleIn">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>
          <h2 className="text-[22px] font-bold text-[#172033]">
            Mượn thiết bị thành công!
          </h2>
          <p className="text-[13px] text-[#667085] mt-1">
            Phiếu mượn đã được ghi nhận vào hệ thống
          </p>
        </div>

        {/* Receipt Details Card */}
        <div className="bg-[#F7F9FC] p-4.5 rounded-2xl border border-[#D9E2F0] space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#D9E2F0]">
            <span className="text-[13px] text-[#667085]">Mã phiếu</span>
            <span className="text-[16px] font-bold text-[#1677FF] tracking-wide">
              {receipt.id}
            </span>
          </div>

          <div className="space-y-2 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Thời gian</span>
              <span className="font-semibold text-[#172033]">{receipt.createdAt}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Phòng</span>
              <span className="font-semibold text-[#172033]">{receipt.roomName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Lớp</span>
              <span className="font-semibold text-[#172033]">{receipt.className}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Chủ đề</span>
              <span className="font-semibold text-[#172033]">{receipt.chapterName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Bài</span>
              <span className="font-semibold text-[#1677FF] text-right truncate max-w-[200px]">
                {receipt.lessonTitle}
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#D9E2F0] flex items-center justify-between text-[14px]">
            <span className="text-[#667085]">Tổng</span>
            <span className="font-bold text-[#172033]">
              {receipt.items.length} loại thiết bị · {totalItems} thiết bị
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2.5 pt-6">
        <button
          id="view-receipt-btn"
          onClick={onViewReceipt}
          className="w-full h-12 bg-[#1677FF] hover:bg-[#0B2A5B] active:scale-[0.99] text-white rounded-xl font-semibold text-[15px] shadow-sm transition-all cursor-pointer flex items-center justify-center"
        >
          XEM PHIẾU
        </button>

        <button
          id="go-home-btn"
          onClick={onGoHome}
          className="w-full h-12 bg-white hover:bg-[#F7F9FC] active:bg-[#EAF3FF] text-[#172033] border border-[#D9E2F0] rounded-xl font-semibold text-[15px] transition-all cursor-pointer flex items-center justify-center"
        >
          VỀ TRANG CHỦ
        </button>
      </div>
    </div>
  );
};
