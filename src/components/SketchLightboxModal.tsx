import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditorSketchCanvasPreview } from './EditorSketchCanvasPreview';

export interface SketchItem {
  title?: string;
  subtitle?: string;
  sceneIndex?: number;
  image?: string;
  sceneData?: any;
  elements?: any[];
}

interface SketchLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  visualizations: SketchItem[];
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  onOpenEditor?: () => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SketchLightboxModal: React.FC<SketchLightboxModalProps> = ({
  isOpen,
  onClose,
  visualizations,
  currentIndex,
  onIndexChange
}) => {
  const [internalIndex, setInternalIndex] = useState(currentIndex);

  useEffect(() => {
    setInternalIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, internalIndex, visualizations?.length]);

  if (!isOpen || !visualizations || visualizations.length === 0) return null;

  const activeIndex = Math.min(Math.max(0, internalIndex), visualizations.length - 1);
  const currentItem = visualizations[activeIndex] || visualizations[0];

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIdx = activeIndex === 0 ? visualizations.length - 1 : activeIndex - 1;
    setInternalIndex(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIdx = activeIndex === visualizations.length - 1 ? 0 : activeIndex + 1;
    setInternalIndex(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6 cursor-pointer select-none transition-all duration-300"
    >
      {/* MODAL CARD CONTAINER - matching Image 1 standard */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[88vh] bg-[#141417] rounded-[28px] border border-white/10 shadow-2xl overflow-hidden flex flex-col cursor-default"
      >
        {/* CLOSE BUTTON AT TOP-RIGHT OF CARD */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          title="Закрыть (Esc)"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* NAVIGATION ARROWS IF MULTIPLE SKETCHES */}
        {visualizations.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-110 active:scale-95"
              title="Предыдущий (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-110 active:scale-95"
              title="Следующий (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* IMAGE / SKETCH PREVIEW CONTAINER */}
        <div className="flex-1 bg-zinc-950 p-4 sm:p-6 overflow-hidden flex items-center justify-center min-h-0">
          <div className="w-full h-full max-h-[68vh] aspect-16/10 rounded-2xl overflow-hidden relative flex items-center justify-center">
            <EditorSketchCanvasPreview
              title={currentItem?.title}
              subtitle={currentItem?.subtitle}
              sceneIndex={currentItem?.sceneIndex ?? activeIndex}
              image={currentItem?.image}
              sceneData={currentItem?.sceneData}
              elements={currentItem?.elements}
              showHuman={!!currentItem?.sceneData?.humanVisible}
              hideBanner={true}
            />
          </div>
        </div>

        {/* FOOTER - TITLE & CATEGORY / SUBTITLE AT BOTTOM */}
        <div className="bg-[#18181c] px-6 py-4 border-t border-zinc-800/80 text-left">
          <h4 className="text-base font-semibold text-white tracking-tight truncate">
            {currentItem?.title || 'Визуализация декор-зоны'}
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5 font-normal">
            {currentItem?.subtitle || 'Концепция оформления'}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
