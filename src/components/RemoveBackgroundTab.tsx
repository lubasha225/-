import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Scissors,
  Paintbrush,
  Upload,
  Eraser,
  Download,
  Warehouse,
  Undo2,
  Redo2,
  Crop as CropIcon,
  X,
  Check,
  Image as ImageIcon,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Sparkles,
  Maximize2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageItem, WarehouseItem } from '../types';

export type EditorTool = 'select' | 'crop' | 'erase' | 'brush' | 'cutout';

// Иконка «Удаление фона» (ножницы с крупными выразительными звёздами-ушками и четкими отверстиями)
export function CutoutScissorsIcon({
  className = 'w-5 h-5',
  strokeWidth = 2
}: {
  className?: string;
  strokeWidth?: number;
  sparkClassName?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} shrink-0`}
    >
      {/* Верхнее крупное ушко-звезда с большим отверстием */}
      <path
        d="M6.5 1 C6.5 4.3 3.8 6.5 1 6.5 C3.8 6.5 6.5 8.7 6.5 12 C6.5 8.7 9.2 6.5 12 6.5 C9.2 6.5 6.5 4.3 6.5 1 Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <circle cx="6.5" cy="6.5" r="2.3" strokeWidth={strokeWidth} />

      {/* Нижнее крупное ушко-звезда с большим отверстием */}
      <path
        d="M6.5 12 C6.5 15.3 3.8 17.5 1 17.5 C3.8 17.5 6.5 19.7 6.5 23 C6.5 19.7 9.2 17.5 12 17.5 C9.2 17.5 6.5 15.3 6.5 12 Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <circle cx="6.5" cy="17.5" r="2.3" strokeWidth={strokeWidth} />

      {/* Лезвие 1: от нижнего ушка вверх */}
      <line x1="8.8" y1="15.5" x2="22.5" y2="6" strokeWidth={strokeWidth} />

      {/* Лезвие 2: от верхнего ушка вниз */}
      <line x1="8.8" y1="8.5" x2="22.5" y2="18" strokeWidth={strokeWidth} />

      {/* Центральный осевой шарнир */}
      <circle cx="13.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export const CutoutSparklesIcon = CutoutScissorsIcon;

interface RemoveBackgroundTabProps {
  images: ImageItem[];
  onUpdateImages: (updated: ImageItem[]) => void;
  onAddWarehouseItem?: (item: Omit<WarehouseItem, 'id'>) => void;
  onOpenMoodboard?: () => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

export default function RemoveBackgroundTab({
  images,
  onUpdateImages,
  onAddWarehouseItem,
  showToast
}: RemoveBackgroundTabProps) {
  // Active Image State
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [activeImageTitle, setActiveImageTitle] = useState<string>('Фото декора');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isProcessingCutout, setIsProcessingCutout] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [isZoomPanelCollapsed, setIsZoomPanelCollapsed] = useState<boolean>(true);
  const [isToolsRailCollapsed, setIsToolsRailCollapsed] = useState<boolean>(false);
  const [isToolSettingsOpen, setIsToolSettingsOpen] = useState<boolean>(false);
  const cachedCutoutRef = useRef<string | null>(null);

  // 4 Primary Tools: select (move), crop (default on load), erase, brush
  const [activeTool, setActiveTool] = useState<EditorTool>('crop');

  const handleToolSelect = (tool: EditorTool) => {
    if (tool === 'cutout') {
      setActiveTool('cutout');
      setIsToolSettingsOpen(false);
      return;
    }
    if (activeTool === tool) {
      setIsToolSettingsOpen((prev) => !prev);
    } else {
      setActiveTool(tool);
      setIsToolSettingsOpen(true);
    }
  };

  // Brush / Eraser tool parameters
  const [brushSize, setBrushSize] = useState<number>(35);
  const [brushHardness, setBrushHardness] = useState<number>(80);
  const [tolerance, setTolerance] = useState<number>(35);

  // Crop Tool States (Percentages 0..48% for each edge)
  const [cropRatioPreset, setCropRatioPreset] = useState<'free' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16'>('free');
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);

  // Interactive Crop Handle Pointer Drag State
  const [draggingCropHandle, setDraggingCropHandle] = useState<string | null>(null);
  const draggingCropHandleRef = useRef<string | null>(null);
  const cropDragStartRef = useRef<{
    startX: number;
    startY: number;
    startCropLeft: number;
    startCropRight: number;
    startCropTop: number;
    startCropBottom: number;
  } | null>(null);

  // Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse / Drawing / Pan State
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const isPanningRef = useRef<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Canvas Pan & Middle-Click Drag State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMiddleDragging, setIsMiddleDragging] = useState<boolean>(false);
  const isMiddleDraggingRef = useRef<boolean>(false);
  const lastMiddlePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch Pan & Pinch Gestures State (Mobile)
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const touchLastPosRef = useRef<{ x: number; y: number } | null>(null);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomScaleRef = useRef<number>(1.0);
  const lastPinchMidRef = useRef<{ x: number; y: number } | null>(null);

  // Canvas element bounding rect state for exact cursor positioning
  const [canvasDisplayRect, setCanvasDisplayRect] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Undo / Redo History
  const historyStackRef = useRef<ImageData[]>([]);
  const historyStepRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Save Modal States
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<number>(1500);
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);

  // Save Mask State to Undo Stack
  const saveMaskHistoryState = useCallback((maskCtx: CanvasRenderingContext2D, w: number, h: number) => {
    const currentData = maskCtx.getImageData(0, 0, w, h);
    const step = historyStepRef.current + 1;
    historyStackRef.current = historyStackRef.current.slice(0, step);
    historyStackRef.current.push(currentData);
    historyStepRef.current = step;

    setCanUndo(step > 0);
    setCanRedo(false);
  }, []);

  // Composite render to displayCanvas
  const renderCompositeCanvas = useCallback(() => {
    const origCanvas = originalCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const dispCanvas = displayCanvasRef.current;
    if (!origCanvas || !maskCanvas || !dispCanvas) return;

    const w = origCanvas.width;
    const h = origCanvas.height;
    if (w === 0 || h === 0) return;

    const dispCtx = dispCanvas.getContext('2d');
    if (!dispCtx) return;

    // Clear display canvas
    dispCtx.clearRect(0, 0, w, h);

    // Draw final masked original image
    dispCtx.drawImage(origCanvas, 0, 0);
    dispCtx.globalCompositeOperation = 'destination-in';
    dispCtx.drawImage(maskCanvas, 0, 0);
    dispCtx.globalCompositeOperation = 'source-over';

    // Update display canvas size in state for accurate mouse scaling
    if (dispCanvas.getBoundingClientRect) {
      const rect = dispCanvas.getBoundingClientRect();
      setCanvasDisplayRect({ width: rect.width, height: rect.height });
    }
  }, []);

  // Automatic Background Removal Algorithm with multi-point border sampling
  const performAutoBackgroundRemoval = useCallback((origCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement, tol: number, customBgHex?: string) => {
    const w = origCanvas.width;
    const h = origCanvas.height;
    if (w === 0 || h === 0) return;

    const origCtx = origCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!origCtx || !maskCtx) return;

    const origData = origCtx.getImageData(0, 0, w, h);
    const maskData = maskCtx.createImageData(w, h);
    const src = origData.data;
    const dst = maskData.data;

    // Collect border samples (corners + edge points)
    const sampleCoords: [number, number][] = [
      [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
      [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
      [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)],
      [Math.floor(w / 4), 0], [Math.floor((3 * w) / 4), 0],
      [Math.floor(w / 4), h - 1], [Math.floor((3 * w) / 4), h - 1]
    ];

    const bgSamples: [number, number, number][] = [];
    sampleCoords.forEach(([sx, sy]) => {
      const idx = (sy * w + sx) * 4;
      bgSamples.push([src[idx], src[idx + 1], src[idx + 2]]);
    });

    if (customBgHex && customBgHex.startsWith('#') && customBgHex.length === 7) {
      const cr = parseInt(customBgHex.slice(1, 3), 16);
      const cg = parseInt(customBgHex.slice(3, 5), 16);
      const cb = parseInt(customBgHex.slice(5, 7), 16);
      if (!isNaN(cr) && !isNaN(cg) && !isNaN(cb)) {
        bgSamples.push([cr, cg, cb]);
      }
    }

    const maxDist = (tol / 100) * 200;

    for (let i = 0; i < src.length; i += 4) {
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];

      let minDist = Infinity;
      for (const [br, bg, bb] of bgSamples) {
        const dist = Math.sqrt((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2);
        if (dist < minDist) {
          minDist = dist;
          if (minDist < maxDist) break;
        }
      }

      if (minDist < maxDist) {
        dst[i] = 0;
        dst[i + 1] = 0;
        dst[i + 2] = 0;
        dst[i + 3] = 0;
      } else {
        dst[i] = 255;
        dst[i + 1] = 255;
        dst[i + 2] = 255;
        dst[i + 3] = 255;
      }
    }

    maskCtx.putImageData(maskData, 0, 0);
    saveMaskHistoryState(maskCtx, w, h);
    renderCompositeCanvas();
  }, [renderCompositeCanvas, saveMaskHistoryState]);

  // Initialize Canvas with Image (Crop is activated by default!)
  const initCanvas = useCallback((url: string) => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      const origCanvas = originalCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const dispCanvas = displayCanvasRef.current;
      if (!origCanvas || !maskCanvas || !dispCanvas) return;

      const w = img.width;
      const h = img.height;

      origCanvas.width = w;
      origCanvas.height = h;
      maskCanvas.width = w;
      maskCanvas.height = h;
      dispCanvas.width = w;
      dispCanvas.height = h;

      // Draw original image to originalCanvas
      const origCtx = origCanvas.getContext('2d');
      if (origCtx) {
        origCtx.clearRect(0, 0, w, h);
        origCtx.drawImage(img, 0, 0);
      }

      // Initialize mask (fully opaque white initially)
      const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
      if (maskCtx) {
        maskCtx.fillStyle = '#FFFFFF';
        maskCtx.fillRect(0, 0, w, h);

        historyStackRef.current = [];
        historyStepRef.current = -1;
        saveMaskHistoryState(maskCtx, w, h);
      }

      // Default active tool is CROP upon loading an image
      setActiveTool('crop');
      setCropLeft(0);
      setCropRight(0);
      setCropTop(0);
      setCropBottom(0);
      setCropRatioPreset('free');
      setZoomScale(0.82);
      setPanOffset({ x: 0, y: 0 });

      setImageLoaded(true);
    };
  }, [saveMaskHistoryState]);

  useEffect(() => {
    if (originalImageUrl) {
      initCanvas(originalImageUrl);
    }
  }, [originalImageUrl, initCanvas]);

  useEffect(() => {
    if (imageLoaded) {
      renderCompositeCanvas();
    }
  }, [imageLoaded, renderCompositeCanvas]);

  // Non-passive wheel event listener for smooth canvas zooming
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setZoomScale((prev) => Math.min(3.0, Math.max(0.5, Math.round((prev + delta) * 10) / 10)));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [imageLoaded, originalImageUrl]);

  // Undo / Redo Handlers
  const handleUndo = () => {
    if (historyStepRef.current > 0) {
      historyStepRef.current -= 1;
      const prevData = historyStackRef.current[historyStepRef.current];
      const maskCtx = maskCanvasRef.current?.getContext('2d');
      if (maskCtx && prevData) {
        maskCtx.putImageData(prevData, 0, 0);
        renderCompositeCanvas();
        setCanUndo(historyStepRef.current > 0);
        setCanRedo(true);
      }
    }
  };

  const handleRedo = () => {
    if (historyStepRef.current < historyStackRef.current.length - 1) {
      historyStepRef.current += 1;
      const nextData = historyStackRef.current[historyStepRef.current];
      const maskCtx = maskCanvasRef.current?.getContext('2d');
      if (maskCtx && nextData) {
        maskCtx.putImageData(nextData, 0, 0);
        renderCompositeCanvas();
        setCanUndo(true);
        setCanRedo(historyStepRef.current < historyStackRef.current.length - 1);
      }
    }
  };

  // Brush Paint / Erase on Mask Canvas with True Brush Hardness Falloff
  const lastBrushPosRef = useRef<{ x: number; y: number } | null>(null);

  const applyBrushToMask = (canvasX: number, canvasY: number, prevX?: number, prevY?: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.save();

    const isErase = activeTool === 'erase';
    if (isErase) {
      maskCtx.globalCompositeOperation = 'destination-out';
    } else {
      maskCtx.globalCompositeOperation = 'source-over';
    }

    const radius = Math.max(1, brushSize / 2);
    const hardnessFactor = Math.max(0.01, Math.min(1.0, brushHardness / 100));

    if (hardnessFactor >= 0.96) {
      // 100% Crisp / Hard Brush
      maskCtx.fillStyle = isErase ? 'rgba(0,0,0,1)' : '#FFFFFF';
      maskCtx.strokeStyle = isErase ? 'rgba(0,0,0,1)' : '#FFFFFF';
      maskCtx.lineWidth = brushSize;
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';

      if (prevX !== undefined && prevY !== undefined) {
        maskCtx.beginPath();
        maskCtx.moveTo(prevX, prevY);
        maskCtx.lineTo(canvasX, canvasY);
        maskCtx.stroke();
      }

      maskCtx.beginPath();
      maskCtx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
      maskCtx.fill();
    } else {
      // Soft / Feathered Brush using Radial Gradient stamp interpolation
      const drawSoftStamp = (cx: number, cy: number) => {
        const innerRadius = radius * hardnessFactor;
        const grad = maskCtx.createRadialGradient(cx, cy, innerRadius, cx, cy, radius);
        if (isErase) {
          grad.addColorStop(0, 'rgba(0,0,0,1)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          grad.addColorStop(0, 'rgba(255,255,255,1)');
          grad.addColorStop(1, 'rgba(255,255,255,0)');
        }
        maskCtx.fillStyle = grad;
        maskCtx.beginPath();
        maskCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        maskCtx.fill();
      };

      if (prevX !== undefined && prevY !== undefined) {
        const dist = Math.hypot(canvasX - prevX, canvasY - prevY);
        const stepSize = Math.max(1.5, radius * 0.15);
        const steps = Math.max(1, Math.ceil(dist / stepSize));
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const sx = prevX + (canvasX - prevX) * t;
          const sy = prevY + (canvasY - prevY) * t;
          drawSoftStamp(sx, sy);
        }
      } else {
        drawSoftStamp(canvasX, canvasY);
      }
    }

    maskCtx.restore();
    renderCompositeCanvas();
  };

  // Canvas Container Middle-Click Pan Drag Event Handlers
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || activeTool === 'select') {
      e.preventDefault();
      isMiddleDraggingRef.current = true;
      setIsMiddleDragging(true);
      lastMiddlePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (isMiddleDraggingRef.current) {
      e.preventDefault();
      const dx = e.clientX - lastMiddlePosRef.current.x;
      const dy = e.clientY - lastMiddlePosRef.current.y;
      lastMiddlePosRef.current = { x: e.clientX, y: e.clientY };
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const handleContainerMouseUp = () => {
    if (isMiddleDraggingRef.current) {
      isMiddleDraggingRef.current = false;
      setIsMiddleDragging(false);
    }
  };

  // Canvas Container Touch Pan & Pinch Handlers (Mobile)
  const handleContainerTouchStart = (e: React.TouchEvent) => {
    if (draggingCropHandleRef.current) return;
    if (e.touches.length === 1 && e.target !== containerRef.current && activeTool !== 'select') {
      return;
    }
    if (e.touches.length === 1) {
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchLastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      initialPinchDistRef.current = null;
      lastPinchMidRef.current = null;
    } else if (e.touches.length >= 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      initialPinchDistRef.current = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      initialZoomScaleRef.current = zoomScale;
      lastPinchMidRef.current = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
      touchLastPosRef.current = null;
    }
  };

  const handleContainerTouchMove = (e: React.TouchEvent) => {
    if (draggingCropHandleRef.current) return;
    if (e.touches.length === 1 && touchLastPosRef.current) {
      const dx = e.touches[0].clientX - touchLastPosRef.current.x;
      const dy = e.touches[0].clientY - touchLastPosRef.current.y;
      touchLastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (e.touches.length >= 2 && initialPinchDistRef.current && lastPinchMidRef.current) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const currentDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      if (initialPinchDistRef.current > 0) {
        const scaleFactor = currentDist / initialPinchDistRef.current;
        const newZoom = Math.min(3.0, Math.max(0.5, Math.round(initialZoomScaleRef.current * scaleFactor * 10) / 10));
        setZoomScale(newZoom);
      }

      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;
      const dx = midX - lastPinchMidRef.current.x;
      const dy = midY - lastPinchMidRef.current.y;
      lastPinchMidRef.current = { x: midX, y: midY };
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const handleContainerTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      touchStartPosRef.current = null;
      touchLastPosRef.current = null;
      initialPinchDistRef.current = null;
      lastPinchMidRef.current = null;
    } else if (e.touches.length === 1) {
      touchLastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      initialPinchDistRef.current = null;
      lastPinchMidRef.current = null;
    }
  };

  const handleContainerWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
      setZoomScale((prev) => Math.min(3.0, Math.max(0.5, Math.round((prev + zoomDelta) * 10) / 10)));
    } else {
      if (e.shiftKey) {
        setPanOffset((prev) => ({ ...prev, x: prev.x - e.deltaY }));
      } else {
        setPanOffset((prev) => ({ ...prev, y: prev.y - e.deltaY }));
      }
    }
  };

  // Canvas Mouse / Touch Event Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || activeTool === 'select') {
      e.preventDefault();
      isMiddleDraggingRef.current = true;
      setIsMiddleDragging(true);
      lastMiddlePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }
    if (e.button !== 0) return;

    if (!displayCanvasRef.current) return;
    const rect = displayCanvasRef.current.getBoundingClientRect();
    const scaleX = displayCanvasRef.current.width / rect.width;
    const scaleY = displayCanvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCursorPos({
      x: (e.clientX - rect.left) / zoomScale,
      y: (e.clientY - rect.top) / zoomScale
    });
    setCanvasDisplayRect({
      width: rect.width / zoomScale,
      height: rect.height / zoomScale
    });

    if (activeTool === 'erase' || activeTool === 'brush') {
      setIsMouseDown(true);
      lastBrushPosRef.current = { x, y };
      applyBrushToMask(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMiddleDraggingRef.current) {
      e.preventDefault();
      const dx = e.clientX - lastMiddlePosRef.current.x;
      const dy = e.clientY - lastMiddlePosRef.current.y;
      lastMiddlePosRef.current = { x: e.clientX, y: e.clientY };
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }

    if (!displayCanvasRef.current) return;
    const rect = displayCanvasRef.current.getBoundingClientRect();

    setCursorPos({
      x: (e.clientX - rect.left) / zoomScale,
      y: (e.clientY - rect.top) / zoomScale
    });
    setCanvasDisplayRect({
      width: rect.width / zoomScale,
      height: rect.height / zoomScale
    });

    if (isMouseDown && (activeTool === 'erase' || activeTool === 'brush')) {
      const scaleX = displayCanvasRef.current.width / rect.width;
      const scaleY = displayCanvasRef.current.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      applyBrushToMask(x, y, lastBrushPosRef.current?.x, lastBrushPosRef.current?.y);
      lastBrushPosRef.current = { x, y };
    }
  };

  const handleCanvasMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!displayCanvasRef.current) return;
    const rect = displayCanvasRef.current.getBoundingClientRect();
    setCursorPos({
      x: (e.clientX - rect.left) / zoomScale,
      y: (e.clientY - rect.top) / zoomScale
    });
    setCanvasDisplayRect({
      width: rect.width / zoomScale,
      height: rect.height / zoomScale
    });
  };

  const handleCanvasMouseLeave = () => {
    handleCanvasMouseUp();
    setCursorPos(null);
  };

  const handleCanvasMouseUp = () => {
    if (isMiddleDraggingRef.current) {
      isMiddleDraggingRef.current = false;
      setIsMiddleDragging(false);
    }
    lastBrushPosRef.current = null;
    if (isMouseDown && (activeTool === 'erase' || activeTool === 'brush')) {
      setIsMouseDown(false);
      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          saveMaskHistoryState(maskCtx, maskCanvas.width, maskCanvas.height);
        }
      }
    }
  };

  // Canvas Direct Touch Event Handlers
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      if (activeTool === 'select') {
        handleContainerTouchStart(e);
        return;
      }
      e.stopPropagation();
      if (!displayCanvasRef.current) return;
      const rect = displayCanvasRef.current.getBoundingClientRect();
      const scaleX = displayCanvasRef.current.width / rect.width;
      const scaleY = displayCanvasRef.current.height / rect.height;

      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      setCursorPos({
        x: (touch.clientX - rect.left) / zoomScale,
        y: (touch.clientY - rect.top) / zoomScale
      });
      setCanvasDisplayRect({
        width: rect.width / zoomScale,
        height: rect.height / zoomScale
      });

      if (activeTool === 'erase' || activeTool === 'brush') {
        setIsMouseDown(true);
        lastBrushPosRef.current = { x, y };
        applyBrushToMask(x, y);
      }
    } else if (e.touches.length >= 2) {
      if (isMouseDown) {
        setIsMouseDown(false);
        lastBrushPosRef.current = null;
        setCursorPos(null);
        const maskCanvas = maskCanvasRef.current;
        if (maskCanvas) {
          const maskCtx = maskCanvas.getContext('2d');
          if (maskCtx) {
            saveMaskHistoryState(maskCtx, maskCanvas.width, maskCanvas.height);
          }
        }
      }
      handleContainerTouchStart(e);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      if (activeTool === 'select') {
        handleContainerTouchMove(e);
        return;
      }
      e.stopPropagation();
      if (isMouseDown && (activeTool === 'erase' || activeTool === 'brush')) {
        if (!displayCanvasRef.current) return;
        const rect = displayCanvasRef.current.getBoundingClientRect();
        const scaleX = displayCanvasRef.current.width / rect.width;
        const scaleY = displayCanvasRef.current.height / rect.height;

        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        setCursorPos({
          x: (touch.clientX - rect.left) / zoomScale,
          y: (touch.clientY - rect.top) / zoomScale
        });

        applyBrushToMask(x, y, lastBrushPosRef.current?.x, lastBrushPosRef.current?.y);
        lastBrushPosRef.current = { x, y };
      }
    } else if (e.touches.length >= 2) {
      handleContainerTouchMove(e);
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      e.stopPropagation();
    }
    if (isMouseDown && (activeTool === 'erase' || activeTool === 'brush')) {
      setIsMouseDown(false);
      lastBrushPosRef.current = null;
      setCursorPos(null);
      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          saveMaskHistoryState(maskCtx, maskCanvas.width, maskCanvas.height);
        }
      }
    }
    handleContainerTouchEnd(e);
  };

  // Helper to load AI cutout mask into maskCanvas
  const applyCutoutDataToMask = (cutoutUrl: string, callback?: () => void) => {
    const origCanvas = originalCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!origCanvas || !maskCanvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = cutoutUrl;
    img.onload = () => {
      const w = origCanvas.width;
      const h = origCanvas.height;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0, w, h);
        const cutoutData = tempCtx.getImageData(0, 0, w, h).data;
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          const maskData = maskCtx.createImageData(w, h);
          const mDst = maskData.data;

          for (let i = 0; i < cutoutData.length; i += 4) {
            const a = cutoutData[i + 3];
            if (a >= 20) {
              mDst[i] = 255;
              mDst[i + 1] = 255;
              mDst[i + 2] = 255;
              mDst[i + 3] = 255;
            } else {
              mDst[i] = 0;
              mDst[i + 1] = 0;
              mDst[i + 2] = 0;
              mDst[i + 3] = 0;
            }
          }

          maskCtx.putImageData(maskData, 0, 0);
          saveMaskHistoryState(maskCtx, w, h);
          renderCompositeCanvas();
          if (callback) callback();
        }
      }
    };
  };

  // Direct Background Removal Action Handler
  const handleCutout = async () => {
    const origCanvas = originalCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!origCanvas || !maskCanvas) return;

    setIsProcessingCutout(true);
    showToast('Вырезание объекта', 'Удаление фона и очистка контуров...', 'info');

    try {
      const dataUrl = origCanvas.toDataURL('image/png');
      const res = await fetch('/api/ai-remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl
        })
      });

      const resData = await res.json();
      const detectedBgHex = resData.analysis?.bgColorHex;
      if (resData.success && resData.cutoutImageData) {
        cachedCutoutRef.current = resData.cutoutImageData;
        applyCutoutDataToMask(resData.cutoutImageData, () => {
          showToast('Готово', 'Объект успешно вырезан, фон удален.', 'success');
        });
      } else {
        performAutoBackgroundRemoval(origCanvas, maskCanvas, tolerance, detectedBgHex);
        showToast('Готово', 'Объект успешно вырезан.', 'success');
      }
    } catch (err) {
      console.error("Cutout error:", err);
      performAutoBackgroundRemoval(origCanvas, maskCanvas, tolerance);
      showToast('Готово', 'Объект успешно вырезан.', 'success');
    } finally {
      setIsProcessingCutout(false);
    }
  };

  // Reset to original image (fully restore all pixels)
  const handleResetToOriginal = () => {
    const origCanvas = originalCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!origCanvas || !maskCanvas) return;
    const w = origCanvas.width;
    const h = origCanvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.fillStyle = '#FFFFFF';
      maskCtx.fillRect(0, 0, w, h);
      saveMaskHistoryState(maskCtx, w, h);
      renderCompositeCanvas();
      showToast('Сброс', 'Восстановлено исходное изображение.', 'info');
    }
  };

  // File Upload Handler (activates Crop by default)
  const handleUploadNewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setActiveImageTitle(file.name.split('.')[0] || 'Декор');
      setOriginalImageUrl(url);
      setActiveTool('crop');
      setCropRatioPreset('free');
      setCropLeft(0);
      setCropRight(0);
      setCropTop(0);
      setCropBottom(0);
      showToast('Изображение загружено', 'Режим кадрирования активирован.', 'success');
    }
  };

  // Preset Ratio helper with exact pixel aspect calculation
  const handleApplyCropRatioPreset = (preset: 'free' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16') => {
    setCropRatioPreset(preset);
    if (preset === 'free') {
      setCropLeft(0);
      setCropRight(0);
      setCropTop(0);
      setCropBottom(0);
      return;
    }

    const origCanvas = originalCanvasRef.current;
    const cropCont = cropContainerRef.current;
    const origW = origCanvas?.width || cropCont?.clientWidth || 1000;
    const origH = origCanvas?.height || cropCont?.clientHeight || 1000;
    const imgAspect = origW / origH;

    let targetAspect = 1.0;
    if (preset === '1:1') targetAspect = 1.0;
    else if (preset === '4:3') targetAspect = 4 / 3;
    else if (preset === '3:4') targetAspect = 3 / 4;
    else if (preset === '16:9') targetAspect = 16 / 9;
    else if (preset === '9:16') targetAspect = 9 / 16;

    const ratio = targetAspect / imgAspect;

    if (ratio <= 1) {
      const wPct = Math.min(100, Math.max(5, 100 * ratio));
      const horizMargin = (100 - wPct) / 2;
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(horizMargin);
      setCropRight(horizMargin);
    } else {
      const hPct = Math.min(100, Math.max(5, 100 / ratio));
      const vertMargin = (100 - hPct) / 2;
      setCropLeft(0);
      setCropRight(0);
      setCropTop(vertMargin);
      setCropBottom(vertMargin);
    }
  };

  // Crop Sliders & Pointer Drag
  const handleCropChange = (type: 'left' | 'right' | 'top' | 'bottom', val: number) => {
    setCropRatioPreset('free');
    const clampedVal = Math.max(0, Math.min(48, val));
    if (type === 'left') setCropLeft(clampedVal);
    if (type === 'right') setCropRight(clampedVal);
    if (type === 'top') setCropTop(clampedVal);
    if (type === 'bottom') setCropBottom(clampedVal);
  };

  // Interactive Handle Pointer Dragging Event Handlers
  const handleCropPointerDown = (handle: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
    draggingCropHandleRef.current = handle;
    setDraggingCropHandle(handle);
    cropDragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCropLeft: cropLeft,
      startCropRight: cropRight,
      startCropTop: cropTop,
      startCropBottom: cropBottom
    };
  };

  const handleCropPointerMove = (e: React.PointerEvent) => {
    if (!draggingCropHandleRef.current || !cropContainerRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const handle = draggingCropHandleRef.current;

    // Moving the whole crop frame
    if (handle === 'move' && cropDragStartRef.current) {
      const rect = cropContainerRef.current.getBoundingClientRect();
      const dxPct = ((e.clientX - cropDragStartRef.current.startX) / rect.width) * 100;
      const dyPct = ((e.clientY - cropDragStartRef.current.startY) / rect.height) * 100;

      const frameWidth = 100 - cropDragStartRef.current.startCropLeft - cropDragStartRef.current.startCropRight;
      const frameHeight = 100 - cropDragStartRef.current.startCropTop - cropDragStartRef.current.startCropBottom;

      let newLeft = cropDragStartRef.current.startCropLeft + dxPct;
      let newTop = cropDragStartRef.current.startCropTop + dyPct;

      newLeft = Math.max(0, Math.min(100 - frameWidth, newLeft));
      newTop = Math.max(0, Math.min(100 - frameHeight, newTop));

      setCropLeft(newLeft);
      setCropRight(100 - newLeft - frameWidth);
      setCropTop(newTop);
      setCropBottom(100 - newTop - frameHeight);
      return;
    }

    // Resizing via corner or edge handles
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;

    const isLeft = handle === 'left' || handle === 'tl' || handle === 'bl';
    const isRight = handle === 'right' || handle === 'tr' || handle === 'br';
    const isTop = handle === 'top' || handle === 'tl' || handle === 'tr';
    const isBottom = handle === 'bottom' || handle === 'bl' || handle === 'br';

    if (isLeft) setCropLeft(Math.max(0, Math.min(pctX, 100 - cropRight - 5)));
    if (isRight) setCropRight(Math.max(0, Math.min(100 - pctX, 100 - cropLeft - 5)));
    if (isTop) setCropTop(Math.max(0, Math.min(pctY, 100 - cropBottom - 5)));
    if (isBottom) setCropBottom(Math.max(0, Math.min(100 - pctY, 100 - cropTop - 5)));
  };

  const handleCropPointerUp = (e: React.PointerEvent) => {
    if (draggingCropHandleRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
      draggingCropHandleRef.current = null;
      cropDragStartRef.current = null;
      setDraggingCropHandle(null);
    }
  };

  // Apply Crop to Canvas Buffers
  const handleApplyCrop = () => {
    const origCanvas = originalCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!origCanvas || !maskCanvas) return;

    const w = origCanvas.width;
    const h = origCanvas.height;

    const cropX = Math.round((cropLeft / 100) * w);
    const cropY = Math.round((cropTop / 100) * h);
    const cropW = Math.max(10, Math.round(w - cropX - (cropRight / 100) * w));
    const cropH = Math.max(10, Math.round(h - cropY - (cropBottom / 100) * h));

    const tempOrig = document.createElement('canvas');
    tempOrig.width = w;
    tempOrig.height = h;
    tempOrig.getContext('2d')?.drawImage(origCanvas, 0, 0);

    const tempMask = document.createElement('canvas');
    tempMask.width = w;
    tempMask.height = h;
    tempMask.getContext('2d')?.drawImage(maskCanvas, 0, 0);

    // Resize main canvases to crop box
    origCanvas.width = cropW;
    origCanvas.height = cropH;
    maskCanvas.width = cropW;
    maskCanvas.height = cropH;
    if (displayCanvasRef.current) {
      displayCanvasRef.current.width = cropW;
      displayCanvasRef.current.height = cropH;
    }

    const origCtx = origCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });

    if (origCtx && maskCtx) {
      origCtx.drawImage(tempOrig, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      maskCtx.drawImage(tempMask, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      saveMaskHistoryState(maskCtx, cropW, cropH);
    }

    // Reset crop sliders
    setCropLeft(0);
    setCropRight(0);
    setCropTop(0);
    setCropBottom(0);
    setCropRatioPreset('free');
    setIsToolSettingsOpen(false);

    renderCompositeCanvas();
    showToast('Кадрировано', 'Лишние края успешно обрезаны.', 'success');
  };

  // Check if crop frame has active adjustment
  const hasActiveCrop = cropLeft > 0 || cropRight > 0 || cropTop > 0 || cropBottom > 0;

  // Save Result to "Мои изображения" Gallery
  const handleSaveToGallery = () => {
    const dispCanvas = displayCanvasRef.current;
    if (!dispCanvas) return;

    const dataUrl = dispCanvas.toDataURL('image/png');
    const newImage: ImageItem = {
      id: 'img_bg_removed_' + Date.now(),
      title: `${activeImageTitle} (Без фона)`,
      category: 'arches',
      url: dataUrl,
      bgRemoved: true
    };

    onUpdateImages([newImage, ...images]);
    showToast('Сохранено в галерею', `«${newImage.title}» добавлено в «Мои изображения».`, 'success');
  };

  // Download Output PNG file
  const handleDownloadImage = () => {
    const dispCanvas = displayCanvasRef.current;
    if (!dispCanvas) return;

    const dataUrl = dispCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${activeImageTitle}_cutout.png`;
    link.href = dataUrl;
    link.click();

    showToast('Скачивание', 'Файл сохранен на ваше устройство.', 'success');
  };

  // Apply Changes / Save mask state
  const handleApplyChanges = () => {
    if (activeTool === 'crop') {
      handleApplyCrop();
    } else {
      const origCanvas = originalCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (origCanvas && maskCanvas) {
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          saveMaskHistoryState(maskCtx, maskCanvas.width, maskCanvas.height);
        }
      }
      renderCompositeCanvas();
      showToast('Применено', 'Правки успешно применены.', 'success');
    }
  };

  // Create Warehouse Item Modal Submit
  const handleCreateWarehouseItem = (e: React.FormEvent) => {
    e.preventDefault();
    const dispCanvas = displayCanvasRef.current;
    if (!dispCanvas) return;

    const dataUrl = dispCanvas.toDataURL('image/png');

    if (onAddWarehouseItem) {
      onAddWarehouseItem({
        name: newItemName || activeImageTitle,
        category: 'Декор',
        total: newItemQuantity,
        available: newItemQuantity,
        rented: 0,
        pricePerDay: newItemPrice,
        description: 'Вырезанный декор без фона',
        imageUrl: dataUrl
      });

      showToast('Добавлено на склад', `«${newItemName || activeImageTitle}» сохранен в инвентаре.`, 'success');
      setIsWarehouseModalOpen(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* 1. If NO image uploaded yet -> Show Full Glassmorphism Drag & Drop Upload Zone */}
      {!originalImageUrl ? (
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[420px]">
          <div className="w-16 h-16 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] flex items-center justify-center shrink-0 shadow-sm">
            <Upload className="w-8 h-8" />
          </div>

          <div className="max-w-md space-y-1">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Загрузите фото декора
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Выберите или перетащите фотографию любого объекта декора, мебели или флористики. Вы сможете легко кадрировать изображение и удалить фон.
            </p>
          </div>

          <label
            className="text-white rounded-full px-6 py-3 text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95 mt-2 hover:opacity-95"
            style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
          >
            <Upload className="w-4 h-4" />
            <span>Выбрать фото на устройстве</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadNewFile}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        /* 2. Main Editor Workspace Grid */
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-1.5 sm:gap-4 items-stretch h-full min-h-0 overflow-hidden">
          {/* LEFT / CENTER: Interactive Canvas Viewport */}
          <div className="lg:col-span-7 xl:col-span-7 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-none sm:rounded-[28px] border-x-0 sm:border border-y sm:border-y border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-1 sm:p-2.5 flex flex-col items-center justify-between flex-1 min-h-0 lg:min-h-[540px] h-full relative overflow-hidden">
            
            {/* Top Canvas Header Toolbar — Clean without 'Оригинал' button */}
            <div className="w-full flex items-center justify-between gap-1.5 pb-1.5 sm:pb-2.5 mb-1 sm:mb-2 border-b border-zinc-200/40 dark:border-zinc-800/40 shrink-0 overflow-x-auto no-scrollbar px-1 sm:px-0">
              {/* LEFT SIDE: Upload, Undo, Redo */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label
                  className="px-3 sm:px-3.5 py-1.5 rounded-full bg-[var(--primary-accent,#8C52D0)] hover:opacity-95 text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0 text-xs font-semibold active:scale-95"
                  title="Загрузить другое фото"
                >
                  <Upload className="w-4 h-4 text-white shrink-0" />
                  <span className="inline whitespace-nowrap">Загрузить фото</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadNewFile}
                    className="hidden"
                  />
                </label>

                <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-0.5 shrink-0" />

                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
                  title="Отменить действие"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
                  title="Повторить действие"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              {/* RIGHT SIDE: Изображения, На Склад, Скачать */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleSaveToGallery}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white text-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 text-xs font-semibold"
                  title="Сохранить в изображения"
                >
                  <ImageIcon className="w-4 h-4 shrink-0 text-[var(--primary-accent,#8C52D0)]" />
                  <span className="hidden sm:inline whitespace-nowrap">Изображения</span>
                </button>

                {onAddWarehouseItem && (
                  <button
                    onClick={() => {
                      setNewItemName(activeImageTitle);
                      setIsWarehouseModalOpen(true);
                    }}
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white text-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 text-xs font-semibold"
                    title="Склад"
                  >
                    <Warehouse className="w-4 h-4 text-[var(--primary-accent,#8C52D0)] shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">Склад</span>
                  </button>
                )}

                <button
                  onClick={handleDownloadImage}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 text-xs font-medium"
                  title="Скачать PNG на устройство"
                >
                  <Download className="w-4 h-4 shrink-0 text-[var(--primary-accent,#8C52D0)]" />
                  <span className="hidden lg:inline whitespace-nowrap">Скачать</span>
                </button>
              </div>
            </div>

            {/* Canvas Viewport Stage */}
            <div
              ref={containerRef}
              onMouseDown={handleContainerMouseDown}
              onMouseMove={handleContainerMouseMove}
              onMouseUp={handleContainerMouseUp}
              onMouseLeave={handleContainerMouseUp}
              onTouchStart={handleContainerTouchStart}
              onTouchMove={handleContainerTouchMove}
              onTouchEnd={handleContainerTouchEnd}
              onTouchCancel={handleContainerTouchEnd}
              onDoubleClick={() => {
                setZoomScale(0.85);
                setPanOffset({ x: 0, y: 0 });
              }}
              onAuxClick={(e) => e.button === 1 && e.preventDefault()}
              onWheel={handleContainerWheel}
              className={`w-full h-full flex-1 min-h-0 flex items-center justify-center relative rounded-none sm:rounded-2xl overflow-hidden border-x-0 sm:border border-y sm:border-y border-zinc-200/50 dark:border-zinc-800/50 select-none touch-none bg-[radial-gradient(#d1d5db_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#3f3f46_1.2px,transparent_1.2px)] [background-size:16px_16px] bg-zinc-100 dark:bg-zinc-950 p-2 sm:p-4 pr-16 sm:pr-20 ${
                isMiddleDragging || (activeTool === 'select' && isMouseDown) ? 'cursor-grabbing' : activeTool === 'select' ? 'cursor-grab' : ''
              }`}
            >
              {/* VERTICAL TOOL RAIL DOCKED DIRECTLY TO BOTTOM-RIGHT EDGE OF CANVAS */}
              <div className="absolute bottom-1 sm:bottom-3 right-0.5 sm:right-2.5 z-40 flex flex-col items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-1 rounded-full border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs gap-1 transition-all w-11">
                {/* 1. Zoom Indicator / Button at Top */}
                <div className="relative flex flex-col items-center">
                  {/* Vertical Slider Panel expanding UPWARDS above zoom button */}
                  <AnimatePresence>
                    {!isZoomPanelCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseMove={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        className="absolute bottom-full mb-1.5 w-11 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md py-2.5 rounded-full border border-zinc-200/60 dark:border-zinc-800/60 shadow-lg flex flex-col items-center gap-2 text-xs z-50 pointer-events-auto"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomScale((prev) => Math.min(3.0, Math.round((prev + 0.1) * 10) / 10));
                          }}
                          title="Увеличить масштаб"
                          className="p-1 rounded-full hover:bg-white/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>

                        <div 
                          className="h-16 flex items-center justify-center my-0.5"
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <input
                            type="range"
                            min="50"
                            max="300"
                            step="10"
                            value={Math.round(zoomScale * 100)}
                            onChange={(e) => setZoomScale(Number(e.target.value) / 100)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseMove={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => e.stopPropagation()}
                            className="h-14 w-1.5 accent-[var(--primary-accent,#8C52D0)] cursor-pointer appearance-none bg-zinc-200/80 dark:bg-zinc-700/80 rounded-full [writing-mode:vertical-lr] [direction:rtl]"
                            title="Слайдер масштаба"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomScale((prev) => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10));
                          }}
                          title="Уменьшить масштаб"
                          className="p-1 rounded-full hover:bg-white/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>

                        {(zoomScale !== 1 || panOffset.x !== 0 || panOffset.y !== 0) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomScale(1.0);
                              setPanOffset({ x: 0, y: 0 });
                            }}
                            title="Сбросить масштаб (1:1)"
                            className="px-1.5 py-0.5 rounded-full bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] text-[8px] font-bold hover:scale-105 transition-all cursor-pointer"
                          >
                            1:1
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() => setIsZoomPanelCollapsed(!isZoomPanelCollapsed)}
                    title={`Масштаб: ${Math.round(zoomScale * 100)}%`}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      !isZoomPanelCollapsed || zoomScale !== 1 || panOffset.x !== 0 || panOffset.y !== 0
                        ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] font-bold'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Small Divider */}
                <div className="w-6 h-[1px] bg-zinc-300/80 dark:bg-zinc-700/80 my-0.5" />

                {/* Collapse / Expand Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsToolsRailCollapsed(!isToolsRailCollapsed)}
                  title={isToolsRailCollapsed ? 'Развернуть инструменты' : 'Свернуть инструменты'}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
                >
                  {isToolsRailCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>

                {/* When collapsed: show only current active tool icon */}
                {isToolsRailCollapsed ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTool !== 'cutout') {
                        setIsToolSettingsOpen((prev) => !prev);
                      }
                    }}
                    title="Нажмите чтобы настроить инструмент"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-xs cursor-pointer hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                  >
                    {activeTool === 'select' && <Move className="w-4 h-4" />}
                    {activeTool === 'crop' && <CropIcon className="w-4 h-4" />}
                    {activeTool === 'erase' && <Eraser className="w-4 h-4" />}
                    {activeTool === 'brush' && <Paintbrush className="w-4 h-4" />}
                    {activeTool === 'cutout' && <CutoutScissorsIcon className="w-4 h-4" />}
                  </button>
                ) : (
                  /* Expanded list of tools below zoom: Cutout (Scissors with sparkles), Select, Crop, Erase, Restore (Paintbrush) */
                  <>
                    {/* 1. Cutout (CutoutScissorsIcon / Удалить фон) */}
                    <button
                      type="button"
                      onClick={() => handleToolSelect('cutout')}
                      title="Удалить фон"
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        activeTool === 'cutout'
                          ? 'text-white shadow-xs scale-105'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                      }`}
                      style={activeTool === 'cutout' ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                    >
                      <CutoutScissorsIcon className="w-4 h-4" />
                    </button>

                    {/* 2. Crop */}
                    <button
                      type="button"
                      onClick={() => handleToolSelect('crop')}
                      title="Кадрирование (нажмите для пропорций)"
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        activeTool === 'crop'
                          ? 'text-white shadow-xs scale-105'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                      }`}
                      style={activeTool === 'crop' ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                    >
                      <CropIcon className="w-4 h-4" />
                    </button>

                    {/* 3. Eraser */}
                    <button
                      type="button"
                      onClick={() => handleToolSelect('erase')}
                      title="Ластик (нажмите для размера и жесткости)"
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        activeTool === 'erase'
                          ? 'text-white shadow-xs scale-105'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                      }`}
                      style={activeTool === 'erase' ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                    >
                      <Eraser className="w-4 h-4" />
                    </button>

                    {/* 4. Restore (Paintbrush) */}
                    <button
                      type="button"
                      onClick={() => handleToolSelect('brush')}
                      title="Восстановить (нажмите для размера)"
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        activeTool === 'brush'
                          ? 'text-white shadow-xs scale-105'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                      }`}
                      style={activeTool === 'brush' ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                    >
                      <Paintbrush className="w-4 h-4" />
                    </button>

                    {/* 5. Select / Move */}
                    <button
                      type="button"
                      onClick={() => handleToolSelect('select')}
                      title="Выделение / Перемещение (нажмите для параметров)"
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        activeTool === 'select'
                          ? 'text-white shadow-xs scale-105'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                      }`}
                      style={activeTool === 'select' ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                    >
                      <Move className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* COMPACT TOOL SETTINGS POPUP/FLYOUT ON CANVAS (SEMI-TRANSPARENT WITH BLUR) */}
              <AnimatePresence>
                {isToolSettingsOpen && activeTool !== 'cutout' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-1 sm:bottom-3 right-13 sm:right-15 z-50 w-72 max-w-[calc(100vw-55px)] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 shadow-xl p-3.5 space-y-3"
                  >
                    {/* Header with Title and Close Button */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/50 dark:border-zinc-800/50">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-lg bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)]">
                          {activeTool === 'select' && <Move className="w-3.5 h-3.5" />}
                          {activeTool === 'crop' && <CropIcon className="w-3.5 h-3.5" />}
                          {activeTool === 'erase' && <Eraser className="w-3.5 h-3.5" />}
                          {activeTool === 'brush' && <Paintbrush className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {activeTool === 'select' && 'Выделение'}
                          {activeTool === 'crop' && 'Кадрирование'}
                          {activeTool === 'erase' && 'Ластик'}
                          {activeTool === 'brush' && 'Восстановить'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsToolSettingsOpen(false)}
                        className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                        title="Закрыть настройки"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content depending on activeTool */}
                    {activeTool === 'crop' && (
                      <div className="space-y-2.5 text-xs">
                        <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                          Пропорции кадра
                        </div>
                        {/* 5 Compact Rectangular Buttons in a Single Row */}
                        <div className="grid grid-cols-5 gap-1 w-full">
                          {[
                            { id: '1:1', label: '1:1' },
                            { id: '4:3', label: '4:3' },
                            { id: '3:4', label: '3:4' },
                            { id: '16:9', label: '16:9' },
                            { id: '9:16', label: '9:16' }
                          ].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                handleApplyCropRatioPreset(p.id as any);
                                setIsToolSettingsOpen(false);
                              }}
                              className={`py-2 px-0.5 text-[11px] rounded-lg border transition-all cursor-pointer text-center font-medium ${
                                cropRatioPreset === p.id
                                  ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] border-[var(--primary-accent,#8C52D0)] font-bold shadow-2xs'
                                  : 'bg-white/60 dark:bg-zinc-800/60 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTool === 'erase' && (
                      <div className="space-y-2.5 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                            <span>Размер кисти</span>
                            <span className="font-semibold text-[var(--primary-accent,#8C52D0)]">{brushSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="120"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                            <span>Жесткость</span>
                            <span className="font-semibold text-[var(--primary-accent,#8C52D0)]">{brushHardness}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={brushHardness}
                            onChange={(e) => setBrushHardness(Number(e.target.value))}
                            className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                          />
                        </div>
                      </div>
                    )}

                    {activeTool === 'brush' && (
                      <div className="space-y-2.5 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                            <span>Размер кисти</span>
                            <span className="font-semibold text-[var(--primary-accent,#8C52D0)]">{brushSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="120"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                            <span>Жесткость</span>
                            <span className="font-semibold text-[var(--primary-accent,#8C52D0)]">{brushHardness}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={brushHardness}
                            onChange={(e) => setBrushHardness(Number(e.target.value))}
                            className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                          />
                        </div>
                      </div>
                    )}

                    {activeTool === 'select' && (
                      <div className="space-y-2 text-xs">
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          Перемещайте объект по холсту пальцем или курсором мыши.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Processing Scanner Effect on viewport canvas when cutting out */}
              {isProcessingCutout && (
                <div className="absolute inset-0 z-30 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none bg-black/25 backdrop-blur-[1px] flex flex-col justify-between">
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#985DE0] to-transparent shadow-[0_0_20px_#8C52D0,0_0_35px_#8C52D0] animate-scanline">
                    <div className="w-full h-16 -mt-16 bg-gradient-to-b from-transparent via-[#8C52D0]/30 to-transparent" />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8c52d020_1px,transparent_1px),linear-gradient(to_bottom,#8c52d020_1px,transparent_1px)] bg-[size:20px_20px] opacity-70" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-[var(--lavenderAccent)]/60 backdrop-blur-md flex items-center gap-2.5 animate-pulse z-40">
                    <Loader2 className="w-4 h-4 text-purple-300 animate-spin" />
                    <span>Вырезание объекта и удаление фона...</span>
                  </div>
                </div>
              )}

              {/* Hidden Source Canvases */}
              <canvas ref={originalCanvasRef} className="hidden" />
              <canvas ref={maskCanvasRef} className="hidden" />

              {/* Tightly Wrapping Display Stage with Accurate Relative Cursor */}
              <div
                className="relative inline-block max-w-full transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                  transformOrigin: 'center center'
                }}
              >
                {/* Display Canvas */}
                <canvas
                  ref={displayCanvasRef}
                  onMouseEnter={handleCanvasMouseEnter}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseLeave}
                  onTouchStart={handleCanvasTouchStart}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasTouchEnd}
                  onTouchCancel={handleCanvasTouchEnd}
                  className={`max-w-full max-h-[400px] sm:max-h-[460px] object-contain shadow-lg rounded-xl touch-none ${
                    activeTool === 'erase' || activeTool === 'brush'
                      ? 'cursor-none'
                      : activeTool === 'select'
                      ? 'cursor-grab'
                      : 'cursor-default'
                  }`}
                />

                {/* FULLY INTERACTIVE TOUCH & MOUSE CROP FRAME */}
                {activeTool === 'crop' && (
                  <div
                    ref={cropContainerRef}
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    className="absolute inset-0 touch-none select-none z-20 rounded-xl overflow-visible cursor-crosshair"
                  >
                    {/* Darkened Cropped Regions Outside Active Crop Frame */}
                    <div className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-[1px]" style={{ height: `${cropTop}%` }} />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-[1px]" style={{ height: `${cropBottom}%` }} />
                    <div className="absolute top-0 bottom-0 left-0 bg-black/50 backdrop-blur-[1px]" style={{ width: `${cropLeft}%`, top: `${cropTop}%`, bottom: `${cropBottom}%` }} />
                    <div className="absolute top-0 bottom-0 right-0 bg-black/50 backdrop-blur-[1px]" style={{ width: `${cropRight}%`, top: `${cropTop}%`, bottom: `${cropBottom}%` }} />

                    {/* Active Crop Box with 3x3 Grid Lines */}
                    <div
                      onPointerDown={(e) => handleCropPointerDown('move', e)}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      className="absolute shadow-2xl transition-shadow pointer-events-auto cursor-move"
                      style={{
                        left: `${cropLeft}%`,
                        right: `${cropRight}%`,
                        top: `${cropTop}%`,
                        bottom: `${cropBottom}%`,
                        borderWidth: `${2 / zoomScale}px`,
                        borderColor: 'white',
                        borderStyle: 'solid'
                      }}
                    >
                      {/* 3x3 Rule of Thirds Crop Grid */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                        <div className="border-r border-b border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div className="border-r border-b border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div className="border-b border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div className="border-r border-b border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div className="border-r border-b border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div className="border-b border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div className="border-r border-b border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div className="border-r border-b border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div />
                      </div>

                      {/* Dimension Badge Pill Above Frame */}
                      <div
                        className="absolute -top-8 left-1/2 bg-zinc-950/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5 border border-white/30 backdrop-blur-xs pointer-events-none"
                        style={{
                          transform: `translateX(-50%) scale(${1 / zoomScale})`,
                          transformOrigin: 'bottom center'
                        }}
                      >
                        <span>Ш: {Math.round(100 - cropLeft - cropRight)}%</span>
                        <span className="text-zinc-400">•</span>
                        <span>В: {Math.round(100 - cropTop - cropBottom)}%</span>
                      </div>

                      {/* CORNER HANDLES */}
                      {/* Top-Left */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('tl', e)}
                        className="absolute -top-5.5 -left-5.5 w-11 h-11 flex items-center justify-center cursor-nwse-resize z-30 touch-none select-none"
                        title="Потяните за угол"
                      >
                        <div
                          className="relative w-5 h-5 bg-white border-[2.5px] border-[var(--primary-accent,#8C52D0)] rounded-md shadow-xl hover:scale-125 transition-transform flex items-center justify-center"
                          style={{ transform: `scale(${1 / zoomScale})` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-xs bg-[var(--primary-accent,#8C52D0)]" />
                        </div>
                      </div>

                      {/* Top-Right */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('tr', e)}
                        className="absolute -top-5.5 -right-5.5 w-11 h-11 flex items-center justify-center cursor-nesw-resize z-30 touch-none select-none"
                        title="Потяните за угол"
                      >
                        <div
                          className="relative w-5 h-5 bg-white border-[2.5px] border-[var(--primary-accent,#8C52D0)] rounded-md shadow-xl hover:scale-125 transition-transform flex items-center justify-center"
                          style={{ transform: `scale(${1 / zoomScale})` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-xs bg-[var(--primary-accent,#8C52D0)]" />
                        </div>
                      </div>

                      {/* Bottom-Left */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('bl', e)}
                        className="absolute -bottom-5.5 -left-5.5 w-11 h-11 flex items-center justify-center cursor-nesw-resize z-30 touch-none select-none"
                        title="Потяните за угол"
                      >
                        <div
                          className="relative w-5 h-5 bg-white border-[2.5px] border-[var(--primary-accent,#8C52D0)] rounded-md shadow-xl hover:scale-125 transition-transform flex items-center justify-center"
                          style={{ transform: `scale(${1 / zoomScale})` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-xs bg-[var(--primary-accent,#8C52D0)]" />
                        </div>
                      </div>

                      {/* Bottom-Right */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('br', e)}
                        className="absolute -bottom-5.5 -right-5.5 w-11 h-11 flex items-center justify-center cursor-nwse-resize z-30 touch-none select-none"
                        title="Потяните за угол"
                      >
                        <div
                          className="relative w-5 h-5 bg-white border-[2.5px] border-[var(--primary-accent,#8C52D0)] rounded-md shadow-xl hover:scale-125 transition-transform flex items-center justify-center"
                          style={{ transform: `scale(${1 / zoomScale})` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-xs bg-[var(--primary-accent,#8C52D0)]" />
                        </div>
                      </div>

                      {/* EDGE MIDDLE HANDLES */}
                      {/* Top */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('top', e)}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-9 flex items-center justify-center cursor-ns-resize z-30 touch-none select-none"
                        title="Потяните верхний край"
                      >
                        <div
                          className="w-8 h-2.5 bg-white border-2 border-[var(--primary-accent,#8C52D0)] rounded-full shadow-lg hover:scale-110 transition-transform"
                          style={{ transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* Bottom */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('bottom', e)}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-9 flex items-center justify-center cursor-ns-resize z-30 touch-none select-none"
                        title="Потяните нижний край"
                      >
                        <div
                          className="w-8 h-2.5 bg-white border-2 border-[var(--primary-accent,#8C52D0)] rounded-full shadow-lg hover:scale-110 transition-transform"
                          style={{ transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* Left */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('left', e)}
                        className="absolute top-1/2 -left-4 -translate-y-1/2 w-9 h-14 flex items-center justify-center cursor-ew-resize z-30 touch-none select-none"
                        title="Потяните левый край"
                      >
                        <div
                          className="w-2.5 h-8 bg-white border-2 border-[var(--primary-accent,#8C52D0)] rounded-full shadow-lg hover:scale-110 transition-transform"
                          style={{ transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* Right */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('right', e)}
                        className="absolute top-1/2 -right-4 -translate-y-1/2 w-9 h-14 flex items-center justify-center cursor-ew-resize z-30 touch-none select-none"
                        title="Потяните правый край"
                      >
                        <div
                          className="w-2.5 h-8 bg-white border-2 border-[var(--primary-accent,#8C52D0)] rounded-full shadow-lg hover:scale-110 transition-transform"
                          style={{ transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Precision Eraser / Brush Cursor Overlay */}
                {cursorPos && (activeTool === 'erase' || activeTool === 'brush') && (
                  <div
                    className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                    style={{
                      left: cursorPos.x,
                      top: cursorPos.y,
                      width: Math.max(4, (brushSize / (displayCanvasRef.current?.width || 1)) * (canvasDisplayRect.width || 1)),
                      height: Math.max(4, (brushSize / (displayCanvasRef.current?.width || 1)) * (canvasDisplayRect.width || 1))
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-full transition-colors ${
                        activeTool === 'erase'
                          ? 'border-[1.5px] border-rose-500 bg-rose-500/20 shadow-[0_0_0_1px_rgba(0,0,0,0.85)]'
                          : 'border-[1.5px] border-[var(--primary-accent,#8C52D0)] bg-[var(--lavenderSoft)]/50 shadow-[0_0_0_1px_rgba(0,0,0,0.85)]'
                      }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-[1px] bg-black/90 shadow-[0_0_1px_#fff]" />
                      <div className="h-2 w-[1px] bg-black/90 shadow-[0_0_1px_#fff] absolute" />
                      <div className="w-1 h-1 rounded-full bg-white border border-black/90 absolute shadow-2xs" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE ONLY: Single Action Button Row (for crop / cutout / select) */}
          {(activeTool === 'crop' || activeTool === 'cutout' || activeTool === 'select') && (
            <div className="lg:hidden w-full px-2.5 sm:px-3 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center gap-2 shrink-0 z-30">
              <button
                type="button"
                onClick={() => {
                  if (activeTool === 'crop') {
                    handleApplyCrop();
                  } else if (activeTool === 'select') {
                    setZoomScale(0.9);
                    setPanOffset({ x: 0, y: 0 });
                    showToast('Центрировано', 'Объект отцентрирован по холсту.', 'info');
                  } else {
                    handleCutout();
                  }
                }}
                disabled={isProcessingCutout}
                className="w-full py-2.5 sm:py-3 px-4 rounded-full text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:opacity-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
              >
                {isProcessingCutout ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : activeTool === 'crop' ? (
                  <CropIcon className="w-4 h-4" />
                ) : activeTool === 'select' ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <CutoutScissorsIcon className="w-4 h-4" />
                )}
                <span className="whitespace-nowrap font-bold">
                  {isProcessingCutout
                    ? 'Вырезание...'
                    : activeTool === 'crop'
                    ? 'Обрезать'
                    : activeTool === 'select'
                    ? 'Центрировать объект'
                    : 'Удалить фон'}
                </span>
              </button>
            </div>
          )}

          {/* DESKTOP RIGHT SIDEBAR: Primary Action Row at Top, Tool Selector & Dynamic Settings */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-4 sm:p-5 flex-col justify-start space-y-4">
            
            {/* TOP BLOCK: MAIN DYNAMIC ACTION BUTTON + 5 TOOLS SELECTOR + DYNAMIC SETTINGS */}
            <div className="space-y-4">
              
              {/* 1. TOP MAIN ACTION ROW: 1 Large Action Button for Crop / Cutout / Select */}
              {(activeTool === 'crop' || activeTool === 'cutout' || activeTool === 'select') && (
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTool === 'crop') {
                        handleApplyCrop();
                      } else if (activeTool === 'select') {
                        setZoomScale(0.9);
                        setPanOffset({ x: 0, y: 0 });
                        showToast('Центрировано', 'Объект отцентрирован по холсту.', 'info');
                      } else {
                        handleCutout();
                      }
                    }}
                    disabled={isProcessingCutout}
                    className="w-full py-3 px-4 rounded-full text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:opacity-95 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                  >
                    {isProcessingCutout ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : activeTool === 'crop' ? (
                      <CropIcon className="w-4 h-4" />
                    ) : activeTool === 'select' ? (
                      <Maximize2 className="w-4 h-4" />
                    ) : (
                      <CutoutScissorsIcon className="w-4 h-4" />
                    )}
                    <span className="whitespace-nowrap font-bold">
                      {isProcessingCutout
                        ? 'Вырезание объекта...'
                        : activeTool === 'crop'
                        ? 'Обрезать'
                        : activeTool === 'select'
                        ? 'Центрировать объект'
                        : 'Удалить фон'}
                    </span>
                  </button>
                </div>
              )}

              {/* 2. TOOLS SELECTOR: Individual Circular Buttons with Captions Below, No Shared White Bar */}
              <div>
                <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase block mb-2">
                  ИНСТРУМЕНТ РЕДАКТОРА
                </span>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 justify-items-center">
                  {[
                    { id: 'cutout', label: 'Удалить фон', icon: <CutoutScissorsIcon className="w-5 h-5" /> },
                    { id: 'crop', label: 'Кадрировать', icon: <CropIcon className="w-5 h-5" /> },
                    { id: 'erase', label: 'Ластик', icon: <Eraser className="w-5 h-5" /> },
                    { id: 'brush', label: 'Восстановить', icon: <Paintbrush className="w-5 h-5" /> },
                    { id: 'select', label: 'Выделение', icon: <Move className="w-5 h-5" /> }
                  ].map((tool) => {
                    const isSelected = activeTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveTool(tool.id as EditorTool)}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer w-full transition-all focus:outline-hidden"
                      >
                        {/* Circular Icon Container */}
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] border border-[var(--primary-accent,#8C52D0)]/40 shadow-xs scale-105 ring-4 ring-[var(--primary-accent,#8C52D0)]/10'
                              : 'bg-white/70 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 group-hover:bg-white dark:group-hover:bg-zinc-750 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:border-zinc-300 dark:group-hover:border-zinc-600 shadow-2xs'
                          }`}
                        >
                          {tool.icon}
                        </div>
                        {/* Tool Caption */}
                        <span
                          className={`text-[10px] sm:text-[11px] leading-tight text-center transition-colors ${
                            isSelected
                              ? 'font-bold text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)]'
                              : 'font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                          }`}
                        >
                          {tool.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. DYNAMIC CONTEXTUAL TOOL SETTINGS */}
              <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-3">
                
                {/* SELECT / MOVE SETTINGS */}
                {activeTool === 'select' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)]">
                        <Move className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Перемещение и позиционирование
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Зажмите левую кнопку мыши или проведите пальцем по экрану, чтобы свободно перемещать объект по холсту. Нажмите кнопку «Центрировать объект» сверху, чтобы вернуть объект в центр.
                    </p>
                  </div>
                )}

                {/* CROP TOOL SETTINGS */}
                {activeTool === 'crop' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Пропорции кадра
                      </span>
                      {cropRatioPreset !== 'free' && (
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {cropRatioPreset}
                        </span>
                      )}
                    </div>

                    {/* Aspect Ratio Chips: 1:1, 4:3, 3:4, 16:9, 9:16 (Free is default) */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: '1:1', label: '1:1' },
                        { id: '4:3', label: '4:3' },
                        { id: '3:4', label: '3:4' },
                        { id: '16:9', label: '16:9' },
                        { id: '9:16', label: '9:16' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleApplyCropRatioPreset(p.id as any)}
                          className={`py-1.5 text-[11px] rounded-xl border transition-all cursor-pointer text-center shadow-xs whitespace-nowrap ${
                            cropRatioPreset === p.id
                              ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] border-[var(--primary-accent,#8C52D0)] font-bold shadow-xs'
                              : 'bg-white/80 dark:bg-zinc-800/80 border-zinc-200/60 dark:border-zinc-700/60 hover:bg-white text-zinc-700 dark:text-zinc-200 font-semibold'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Crop Edge Range Sliders */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                          <span>↑ Сверху</span>
                          <span>{Math.round(cropTop)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="48"
                          value={cropTop}
                          onChange={(e) => handleCropChange('top', Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                          <span>↓ Снизу</span>
                          <span>{Math.round(cropBottom)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="48"
                          value={cropBottom}
                          onChange={(e) => handleCropChange('bottom', Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                          <span>← Слева</span>
                          <span>{Math.round(cropLeft)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="48"
                          value={cropLeft}
                          onChange={(e) => handleCropChange('left', Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                          <span>→ Справа</span>
                          <span>{Math.round(cropRight)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="48"
                          value={cropRight}
                          onChange={(e) => handleCropChange('right', Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ERASER SETTINGS */}
                {activeTool === 'erase' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Параметры ластика
                    </div>

                    {/* Brush Size Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <span>Размер кисти</span>
                        <span className="font-semibold text-[var(--primary-accent,#8C52D0)]">{brushSize} px</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                      />
                    </div>

                    {/* Brush Hardness Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <span>Жесткость краев</span>
                        <span className="font-semibold text-[var(--primary-accent,#8C52D0)]">{brushHardness}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={brushHardness}
                        onChange={(e) => setBrushHardness(Number(e.target.value))}
                        className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                      />
                    </div>
                  </div>
                )}

                {/* BRUSH (RESTORE) SETTINGS */}
                {activeTool === 'brush' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Параметры восстанавливающей кисти
                    </div>

                    {/* Brush Size Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <span>Размер кисти</span>
                        <span className="font-semibold text-[var(--primary-accent,#8C52D0)]">{brushSize} px</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                      />
                    </div>

                    {/* Brush Hardness Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <span>Жесткость краев</span>
                        <span className="font-semibold text-[var(--primary-accent,#8C52D0)]">{brushHardness}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={brushHardness}
                        onChange={(e) => setBrushHardness(Number(e.target.value))}
                        className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                      />
                    </div>
                  </div>
                )}

                {/* CUTOUT SETTINGS */}
                {activeTool === 'cutout' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Удаление фона (AI Cutout)
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Автоматически определяет передний план и аккуратно удаляет фон изображения в один клик с помощью кнопки «Удалить фон» в верхней части панели.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Warehouse Modal */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Добавить позицию на склад
              </h3>
              <button onClick={() => setIsWarehouseModalOpen(false)} className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouseItem} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase text-zinc-500 font-semibold block mb-1">
                  Название декора
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--primary-accent,#8C52D0)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold block mb-1">
                    Аренда (₽/сут)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--primary-accent,#8C52D0)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-zinc-500 font-semibold block mb-1">
                    Количество
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--primary-accent,#8C52D0)]"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-zinc-300 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full hover:opacity-95 text-white text-xs font-semibold shadow-md cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                >
                  Сохранить
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
