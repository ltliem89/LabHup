import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BottomActionBarProps {
  typesCount: number;
  totalItems: number;
  onConfirm: () => void;
  visible?: boolean;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  typesCount,
  totalItems,
  onConfirm,
  visible = true,
}) => {
  return (
    <AnimatePresence>
      {visible && typesCount > 0 && (
        <motion.div
          id="bottom-action-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D9E2F0] shadow-lg"
        >
          <div className="max-w-md mx-auto px-4 pt-2.5 pb-[max(12px,env(safe-area-inset-bottom))] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[13px] text-[#667085] px-1 font-medium">
              <span>
                Đã chọn <strong className="text-[#1677FF] font-semibold">{typesCount}</strong> loại
              </span>
              <span>
                Tổng <strong className="text-[#172033] font-bold">{totalItems}</strong> thiết bị
              </span>
            </div>

            <button
              id="confirm-borrow-btn"
              onClick={onConfirm}
              className="w-full h-12 bg-[#1677FF] hover:bg-[#0B2A5B] active:scale-[0.99] text-white rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>XÁC NHẬN MƯỢN</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
