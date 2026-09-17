import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  max: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  max,
  onIncrease,
  onDecrease,
  disabled = false,
}) => {
  const isMinusDisabled = disabled || quantity <= 0;
  const isPlusDisabled = disabled || quantity >= max;

  return (
    <div
      id="quantity-stepper"
      className={`flex items-center gap-1 bg-[#F7F9FC] border border-[#D9E2F0] rounded-xl p-0.5 ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrease();
        }}
        disabled={isMinusDisabled}
        aria-label="Giảm số lượng"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#172033] hover:bg-[#EAF3FF] active:bg-[#1677FF] active:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      <span className="w-6 text-center text-[14px] font-semibold text-[#172033] tabular-nums">
        {quantity}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrease();
        }}
        disabled={isPlusDisabled}
        aria-label="Tăng số lượng"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#172033] hover:bg-[#EAF3FF] active:bg-[#1677FF] active:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>
    </div>
  );
};
