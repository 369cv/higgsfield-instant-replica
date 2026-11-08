import React from 'react';
import { Grid, LayoutGrid, Check } from 'lucide-react';
import { ViewSettings, LayoutMode } from '../types';

interface ViewPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ViewSettings;
  onChangeSettings: (settings: ViewSettings) => void;
}

export const ViewPopover: React.FC<ViewPopoverProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Popover Card - Exact Replica of User Screenshot */}
      <div className="fixed top-14 right-4 z-50 w-64 rounded-2xl bg-surface border border-line p-4 shadow-2xl text-white">
        {/* Layout Section */}
        <div className="text-xs font-medium text-muted mb-3">Layout</div>

        <div className="space-y-1 mb-4">
          {/* Square Option */}
          <button
            onClick={() => onChangeSettings({ ...settings, layout: 'square' })}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
              settings.layout === 'square'
                ? 'bg-white/10 text-white font-medium'
                : 'text-soft hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Grid className="w-4 h-4 text-muted" />
              <span>Square</span>
            </div>
            {settings.layout === 'square' && <Check className="w-4 h-4 text-white" />}
          </button>

          {/* Masonry Option */}
          <button
            onClick={() => onChangeSettings({ ...settings, layout: 'masonry' })}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
              settings.layout === 'masonry'
                ? 'bg-white/10 text-white font-medium'
                : 'text-soft hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-4 h-4 text-muted" />
              <span>Masonry</span>
            </div>
            {settings.layout === 'masonry' && <Check className="w-4 h-4 text-white" />}
          </button>
        </div>

        <div className="h-[1px] bg-line my-3" />

        {/* Split by date Switch */}
        <div className="flex items-center justify-between py-1.5 mb-3">
          <span className="text-sm text-white font-medium">Split by date</span>
          <button
            onClick={() => onChangeSettings({ ...settings, splitByDate: !settings.splitByDate })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.splitByDate ? 'bg-lime' : 'bg-line'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.splitByDate ? 'translate-x-6 bg-black' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="h-[1px] bg-line my-3" />

        {/* Card size slider */}
        <div className="text-xs font-medium text-muted mb-2">Card size</div>
        <div className="px-1 pt-1 pb-2">
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={settings.cardSize}
            onChange={(e) => onChangeSettings({ ...settings, cardSize: Number(e.target.value) })}
            className="w-full accent-lime bg-line h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted px-1 mt-1 font-mono">
            <span>XS</span>
            <span>S</span>
            <span>M</span>
            <span>L</span>
          </div>
        </div>
      </div>
    </>
  );
};
