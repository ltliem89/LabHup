import React, { useState } from 'react';
import { Check, Package } from 'lucide-react';
import { Equipment } from '../types';
import { QuantityControl } from './QuantityControl';

interface EquipmentRowProps {
  equipment: Equipment;
  isSelected: boolean;
  selectedQuantity: number;
  onToggleSelect: () => void;
  onQuantityChange: (qty: number) => void;
}

export const EquipmentRow: React.FC<EquipmentRowProps> = ({
  equipment,
  isSelected,
  selectedQuantity,
  onToggleSelect,
  onQuantityChange,
}) => {
  const [imgError, setImgError] = useState(false);
  const isAvailable = equipment.availableQuantity > 0;

  const handleRowClick = () => {
    if (!isAvailable) return;
    onToggleSelect();
  };

  const handleIncrease = () => {
    if (selectedQuantity < equipment.availableQuantity) {
      onQuantityChange(selectedQuantity + 1);
    }
  };

  const handleDecrease = () => {
    if (selectedQuantity > 1) {
      onQuantityChange(selectedQuantity - 1);
    } else {
      // If decreased from 1 to 0, deselect
      onToggleSelect();
    }
  };

  return (
    <div
      id={`equipment-row-${equipment.id}`}
      onClick={handleRowClick}
      className={`h-[72px] px-3 bg-white border-b border-[#D9E2F0] flex items-center justify-between transition-colors ${
        isAvailable ? 'cursor-pointer hover:bg-[#FAFBFD] active:bg-[#F0F5FF]' : 'opacity-65 cursor-not-allowed bg-[#FAFBFD]'
      } ${isSelected ? 'bg-[#F4F8FF]' : ''}`}
    >
      {/* Left: Checkbox + Thumbnail + Name/Status */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
        {/* Checkbox button (44x44 tap area) */}
        <button
          type="button"
          aria-label={isSelected ? `Bỏ chọn ${equipment.name}` : `Chọn ${equipment.name}`}
          disabled={!isAvailable}
          onClick={(e) => {
            e.stopPropagation();
            if (isAvailable) onToggleSelect();
          }}
          className="w-10 h-10 -ml-1 flex items-center justify-center shrink-0"
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-[#1677FF] border-[#1677FF] text-white shadow-xs'
                : isAvailable
                ? 'bg-white border-[#D9E2F0] hover:border-[#1677FF]'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </button>

        {/* Thumbnail (44x44) */}
        <div className="w-11 h-11 rounded-lg bg-[#F0F4FA] border border-[#D9E2F0] overflow-hidden shrink-0 flex items-center justify-center">
          {equipment.image && !imgError ? (
            <img
              src={equipment.image}
              alt={equipment.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <Package className="w-5 h-5 text-[#667085]" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-semibold text-[#172033] truncate">
              {equipment.name}
            </span>
          </div>
          <div className="text-[12px] mt-0.5">
            {isAvailable ? (
              <span className="text-[#667085]">
                Còn: <strong className="text-[#172033] font-semibold">{equipment.availableQuantity}</strong> / {equipment.totalQuantity}
              </span>
            ) : (
              <span className="text-[#EF4444] font-medium flex items-center gap-1">
                Hết thiết bị
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quantity Stepper (only active if available) */}
      <div className="shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
        {isAvailable ? (
          <QuantityControl
            quantity={isSelected ? selectedQuantity : 0}
            max={equipment.availableQuantity}
            onIncrease={isSelected ? handleIncrease : onToggleSelect}
            onDecrease={handleDecrease}
            disabled={!isSelected}
          />
        ) : (
          <div className="text-[11px] font-medium text-[#667085] bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
            Không khả dụng
          </div>
        )}
      </div>
    </div>
  );
};
