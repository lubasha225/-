import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Scissors,
  Upload,
  Eraser,
  Paintbrush,
  Wand2,
  Download,
  FolderPlus,
  Warehouse,
  Layout,
  Eye,
  Sliders,
  Sparkles,
  Undo2,
  Redo2,
  Crop as CropIcon,
  X,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
  ScanEye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointer,
  ChevronDown,
  ChevronUp,
  Sun,
  Contrast,
  Droplet,
  Layers,
  SlidersHorizontal,
  Plus,
  Minus,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageItem, WarehouseItem } from '../types';

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
  onOpenMoodboard,
  showToast
}: RemoveBackgroundTabProps) {
  // Active Image State
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [activeImageTitle, setActiveImageTitle] = useState<string>('Фото декора');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isProcessingCutout, setIsProcessingCutout] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isZoomPanelCollapsed, setIsZoomPanelCollapsed] = useState<boolean>(true);
  const cachedCutoutRef = useRef<string | null>(null);

  // Tools & Edit Modes
  const [activeTool, setActiveTool] = useState<'erase' | 'restore' | 'wand'>('erase');
  const [brushSize, setBrushSize] = useState<number>(35);
  const [brushHardness, setBrushHardness] = useState<number>(80);
  const [tolerance, setTolerance] = useState<number>(35);

  // Crop Tool States (Percentages 0..50% for each edge)
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);

  // Interactive Crop Handle Pointer Drag State
  const [draggingCropHandle, setDraggingCropHandle] = useState<string | null>(null);

  // Object bounding box in pixels relative to current mask
  const [objectBounds, setObjectBounds] = useState<{ minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } | null>(null);

  // Shadows & Outlines
  const [hasShadow, setHasShadow] = useState<boolean>(false);
  const [shadowBlur, setShadowBlur] = useState<number>(20);
  const [shadowOpacity, setShadowOpacity] = useState<number>(60);
  const [shadowOffsetY, setShadowOffsetY] = useState<number>(15);
  const [hasOutline, setHasOutline] = useState<boolean>(false);
  const [outlineSize, setOutlineSize] = useState<number>(4);

  // Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [activeAdjustTool, setActiveAdjustTool] = useState<'brightness' | 'contrast' | 'saturation' | null>(null);
  const [activeEffectTool, setActiveEffectTool] = useState<'shadow' | 'outline' | null>(null);

  const handleApplyColorPreset = (preset: 'default' | 'vibrant' | 'warm' | 'studio') => {
    if (preset === 'default') {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    } else if (preset === 'vibrant') {
      setBrightness(105);
      setContrast(115);
      setSaturation(130);
    } else if (preset === 'warm') {
      setBrightness(105);
      setContrast(105);
      setSaturation(115);
    } else if (preset === 'studio') {
      setBrightness(110);
      setContrast(110);
      setSaturation(100);
    }
  };

  // View mode
  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);
  const [activeRightTab, setActiveRightTab] = useState<'removal' | 'crop' | 'effects' | 'adjust'>('removal');

  // Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse / Drawing State
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Canvas Pan & Middle-Click Drag State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMiddleDragging, setIsMiddleDragging] = useState<boolean>(false);
  const isMiddleDraggingRef = useRef<boolean>(false);
  const lastMiddlePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Compute non-transparent object boundaries for snap lines
  const computeObjectBounds = useCallback(() => {
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx || !maskCanvasRef.current) return;

    const w = maskCanvasRef.current.width;
    const h = maskCanvasRef.current.height;
    if (w === 0 || h === 0) return;

    const imgData = maskCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;

    // Sample every 2nd pixel for speed
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 15) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (found) {
      setObjectBounds({ minX, minY, maxX, maxY, width: w, height: h });
    } else {
      setObjectBounds(null);
    }
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

    // Apply color adjustments
    dispCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // --- FINAL ISOLATED CUTOUT RENDERING ---
    // 1. Draw floor shadow if enabled
    if (hasShadow) {
      dispCtx.save();
      dispCtx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity / 100})`;
      dispCtx.shadowBlur = shadowBlur;
      dispCtx.shadowOffsetY = shadowOffsetY;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(origCanvas, 0, 0);
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(maskCanvas, 0, 0);
        dispCtx.drawImage(tempCanvas, 0, 0);
      }
      dispCtx.restore();
    }

    // 2. Draw sticker outline if enabled
    if (hasOutline) {
      dispCtx.save();
      dispCtx.shadowColor = '#FFFFFF';
      dispCtx.shadowBlur = outlineSize * 2;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(origCanvas, 0, 0);
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(maskCanvas, 0, 0);
        dispCtx.drawImage(tempCanvas, 0, 0);
      }
      dispCtx.restore();
    }

    // 3. Draw final masked original image
    dispCtx.drawImage(origCanvas, 0, 0);
    dispCtx.globalCompositeOperation = 'destination-in';
    dispCtx.drawImage(maskCanvas, 0, 0);
    dispCtx.globalCompositeOperation = 'source-over';
    dispCtx.filter = 'none';

    // Update display canvas size in state for accurate mouse scaling
    if (dispCanvas.getBoundingClientRect) {
      const rect = dispCanvas.getBoundingClientRect();
      setCanvasDisplayRect({ width: rect.width, height: rect.height });
    }

    computeObjectBounds();
  }, [
    brightness,
    contrast,
    saturation,
    hasShadow,
    shadowOpacity,
    shadowBlur,
    shadowOffsetY,
    hasOutline,
    outlineSize,
    computeObjectBounds
  ]);

  // Automatic Background Removal Algorithm
  const performAutoBackgroundRemoval = useCallback((origCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement, tol: number) => {
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

    // Sample background color from 4 corners
    const corners = [
      (0 * w + 0) * 4,
      (0 * w + (w - 1)) * 4,
      ((h - 1) * w + 0) * 4,
      ((h - 1) * w + (w - 1)) * 4
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    corners.forEach(idx => {
      bgR += src[idx];
      bgG += src[idx + 1];
      bgB += src[idx + 2];
    });
    bgR /= 4;
    bgG /= 4;
    bgB /= 4;

    const maxDist = (tol / 100) * 220;

    for (let i = 0; i < src.length; i += 4) {
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];

      const colorDist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

      if (colorDist < maxDist) {
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

  // Initialize Canvas with Image
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

  // Non-passive wheel event listener for smooth canvas zooming (always active)
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

  // Magic Wand Tool: Color flood fill mask clearing
  const handleWandClick = (canvasX: number, canvasY: number) => {
    const origCanvas = originalCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!origCanvas || !maskCanvas) return;

    const w = origCanvas.width;
    const h = origCanvas.height;
    const origCtx = origCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!origCtx || !maskCtx) return;

    const startX = Math.round(canvasX);
    const startY = Math.round(canvasY);
    if (startX < 0 || startX >= w || startY < 0 || startY >= h) return;

    const origData = origCtx.getImageData(0, 0, w, h);
    const maskData = maskCtx.getImageData(0, 0, w, h);
    const src = origData.data;
    const mask = maskData.data;

    const startIdx = (startY * w + startX) * 4;
    const targetR = src[startIdx];
    const targetG = src[startIdx + 1];
    const targetB = src[startIdx + 2];

    const thresh = (tolerance / 100) * 200;

    for (let i = 0; i < src.length; i += 4) {
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];

      const dist = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2);
      if (dist < thresh) {
        mask[i] = 0;
        mask[i + 1] = 0;
        mask[i + 2] = 0;
        mask[i + 3] = 0;
      }
    }

    maskCtx.putImageData(maskData, 0, 0);
    saveMaskHistoryState(maskCtx, w, h);
    renderCompositeCanvas();
    showToast('Волшебная палочка', 'Похожие фоновые цвета вырезаны.', 'info');
  };

  // Brush Paint / Erase on Mask Canvas
  const lastBrushPosRef = useRef<{ x: number; y: number } | null>(null);

  const applyBrushToMask = (canvasX: number, canvasY: number, prevX?: number, prevY?: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.save();

    if (activeTool === 'erase') {
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.fillStyle = 'rgba(0,0,0,1)';
      maskCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else if (activeTool === 'restore') {
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillStyle = '#FFFFFF';
      maskCtx.strokeStyle = '#FFFFFF';
    }

    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    if (prevX !== undefined && prevY !== undefined) {
      maskCtx.beginPath();
      maskCtx.moveTo(prevX, prevY);
      maskCtx.lineTo(canvasX, canvasY);
      maskCtx.stroke();
    }

    // Always draw an arc at current position to ensure crisp round caps and single clicks work
    maskCtx.beginPath();
    maskCtx.arc(canvasX, canvasY, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();

    maskCtx.restore();
    renderCompositeCanvas();
  };

  // Canvas Container Middle-Click Pan Drag Event Handlers
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
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
    if (e.button === 1) {
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

    if (activeTool === 'wand') {
      handleWandClick(x, y);
      return;
    }

    if (activeTool === 'erase' || activeTool === 'restore') {
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

    if (isMouseDown && (activeTool === 'erase' || activeTool === 'restore')) {
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
    if (isMouseDown && (activeTool === 'erase' || activeTool === 'restore')) {
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

  // Helper to load AI cutout mask into maskCanvas without destroying white foreground pixels
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
            // Opaque subject foreground from AI (alpha >= 20) -> fill mask with white (keep region)
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
      if (resData.success && resData.cutoutImageData) {
        cachedCutoutRef.current = resData.cutoutImageData;
        applyCutoutDataToMask(resData.cutoutImageData, () => {
          showToast('Готово', 'Объект успешно вырезан, фон удален.', 'success');
        });
      } else {
        performAutoBackgroundRemoval(origCanvas, maskCanvas, tolerance);
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

  // File Upload Handler
  const handleUploadNewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setActiveImageTitle(file.name.split('.')[0] || 'Декор');
      setOriginalImageUrl(url);
      setCropLeft(0);
      setCropRight(0);
      setCropTop(0);
      setCropBottom(0);
      showToast('Изображение загружено', 'Готово к вырезанию фона.', 'success');
    }
  };

  // Auto-Crop Fit to Decor object
  const handleAutoFitCrop = () => {
    if (!objectBounds) {
      showToast('Авто-кадрирование', 'Объект еще не загружен или пуст', 'info');
      return;
    }
    const { minX, minY, maxX, maxY, width: totalW, height: totalH } = objectBounds;
    const padding = 2.0; // 2% padding
    const newLeft = Math.max(0, Math.round((minX / totalW) * 100 - padding));
    const newRight = Math.max(0, Math.round(((totalW - maxX) / totalW) * 100 - padding));
    const newTop = Math.max(0, Math.round((minY / totalH) * 100 - padding));
    const newBottom = Math.max(0, Math.round(((totalH - maxY) / totalH) * 100 - padding));

    setCropLeft(newLeft);
    setCropRight(newRight);
    setCropTop(newTop);
    setCropBottom(newBottom);
    showToast('Авто-кадрирование', 'Поля обрезаны по границам предмета', 'success');
  };

  // Preset Ratio helper
  const handleApplyCropRatioPreset = (preset: 'free' | '1:1' | '4:3' | '16:9') => {
    if (preset === 'free') {
      setCropLeft(0);
      setCropRight(0);
      setCropTop(0);
      setCropBottom(0);
    } else if (preset === '1:1') {
      setCropLeft(10);
      setCropRight(10);
      setCropTop(10);
      setCropBottom(10);
    } else if (preset === '4:3') {
      setCropLeft(5);
      setCropRight(5);
      setCropTop(15);
      setCropBottom(15);
    } else if (preset === '16:9') {
      setCropLeft(0);
      setCropRight(0);
      setCropTop(22);
      setCropBottom(22);
    }
  };

  // Crop Sliders & Pointer Drag (clean, no snap indicators or locking)
  const handleCropChange = (type: 'left' | 'right' | 'top' | 'bottom', val: number) => {
    const clampedVal = Math.max(0, Math.min(48, val));
    if (type === 'left') setCropLeft(clampedVal);
    if (type === 'right') setCropRight(clampedVal);
    if (type === 'top') setCropTop(clampedVal);
    if (type === 'bottom') setCropBottom(clampedVal);
  };

  // Interactive Handle Pointer Dragging Event Handlers for Mobile & Desktop
  const handleCropPointerDown = (handle: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
    setDraggingCropHandle(handle);
  };

  const handleCropPointerMove = (e: React.PointerEvent) => {
    if (!draggingCropHandle || !cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;

    const isLeft = draggingCropHandle === 'left' || draggingCropHandle === 'tl' || draggingCropHandle === 'bl';
    const isRight = draggingCropHandle === 'right' || draggingCropHandle === 'tr' || draggingCropHandle === 'br';
    const isTop = draggingCropHandle === 'top' || draggingCropHandle === 'tl' || draggingCropHandle === 'tr';
    const isBottom = draggingCropHandle === 'bottom' || draggingCropHandle === 'bl' || draggingCropHandle === 'br';

    if (isLeft) setCropLeft(Math.max(0, Math.min(pctX, 100 - cropRight - 5)));
    if (isRight) setCropRight(Math.max(0, Math.min(100 - pctX, 100 - cropLeft - 5)));
    if (isTop) setCropTop(Math.max(0, Math.min(pctY, 100 - cropBottom - 5)));
    if (isBottom) setCropBottom(Math.max(0, Math.min(100 - pctY, 100 - cropTop - 5)));
  };

  const handleCropPointerUp = (e: React.PointerEvent) => {
    if (draggingCropHandle) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
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

    // Temporary copy canvases
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

    renderCompositeCanvas();
    showToast('Кадрировано', 'Лишние края успешно обрезаны.', 'success');
  };

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

  // Universal Apply action handler for quick floating bar & sidebar controls
  const handleUniversalApply = () => {
    if (activeRightTab === 'removal') {
      handleCutout();
    } else if (activeRightTab === 'crop') {
      handleApplyCrop();
    } else if (activeRightTab === 'effects' || activeRightTab === 'adjust') {
      renderCompositeCanvas();
      showToast('Применено', 'Изменения успешно применены к изображению.', 'success');
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
              Выберите или перетащите фотографию любого объекта декора, мебели или флористики. Сервис автоматически сгладит края и подготовит файл без фона.
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
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-2 sm:gap-4 items-stretch h-full min-h-0">
          {/* LEFT / CENTER: Interactive Canvas Viewport (8 Columns on desktop, flex-1 on mobile) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[24px] sm:rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-2 sm:p-2.5 flex flex-col items-center justify-between flex-1 min-h-[380px] sm:min-h-[480px] lg:min-h-[580px] h-full relative overflow-hidden">
            
            {/* Top Canvas Toolbar — Responsive labels for desktop / landscape tablets, compact icons for mobile */}
            <div className="w-full flex items-center justify-between gap-1.5 pb-2.5 mb-2 border-b border-zinc-200/40 dark:border-zinc-800/40 shrink-0 overflow-x-auto no-scrollbar">
              {/* LEFT SIDE: Upload, Undo, Redo, Original Compare */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label
                  className="px-2.5 sm:px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0 text-xs font-medium"
                  title="Загрузить другое фото"
                >
                  <Upload className="w-4 h-4 text-[var(--primary-accent,#8C52D0)] shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Загрузить</span>
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

                <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-0.5 shrink-0" />

                <button
                  onMouseDown={() => setShowOriginalComparison(true)}
                  onMouseUp={() => setShowOriginalComparison(false)}
                  onMouseLeave={() => setShowOriginalComparison(false)}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5 text-xs font-medium border border-zinc-200/60 dark:border-zinc-700/60 ${
                    showOriginalComparison
                      ? 'text-white border-transparent'
                      : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-white'
                  }`}
                  style={showOriginalComparison ? { background: 'var(--primary-accent, #8C52D0)' } : undefined}
                  title="Удерживайте для просмотра оригинала"
                >
                  <Eye className="w-4 h-4 shrink-0 text-[var(--primary-accent,#8C52D0)]" />
                  <span className="hidden md:inline whitespace-nowrap">Оригинал</span>
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
                    title="Сохранить на Склад"
                  >
                    <Warehouse className="w-4 h-4 text-[var(--primary-accent,#8C52D0)] shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">На склад</span>
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
              onAuxClick={(e) => e.button === 1 && e.preventDefault()}
              onWheel={handleContainerWheel}
              className={`w-full h-full flex-1 flex items-center justify-center relative rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 select-none bg-[radial-gradient(#d1d5db_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#3f3f46_1.2px,transparent_1.2px)] [background-size:16px_16px] bg-zinc-100 dark:bg-zinc-950 p-1.5 sm:p-2 ${
                isMiddleDragging ? 'cursor-grabbing' : ''
              }`}
            >
              {/* Standalone Round Zoom Button & Vertical Scale Slider (Top Right Corner of Canvas Box) */}
              <div className="absolute top-3 right-3 z-40 flex flex-col items-center w-10">
                <button
                  onClick={() => setIsZoomPanelCollapsed(!isZoomPanelCollapsed)}
                  title={`Масштаб: ${Math.round(zoomScale * 100)}%`}
                  className={`w-10 h-10 rounded-full backdrop-blur-md shadow-sm border transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
                    !isZoomPanelCollapsed || zoomScale !== 1
                      ? 'text-white'
                      : 'bg-white/60 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-200 border-zinc-200/50 dark:border-zinc-800/50 hover:bg-white/90'
                  }`}
                  style={!isZoomPanelCollapsed || zoomScale !== 1 ? { background: 'var(--primary-accent, #8C52D0)', borderColor: 'var(--primary-accent, #8C52D0)' } : undefined}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Vertical Slider Panel directly below zoom button, matching width and fully rounded */}
                {!isZoomPanelCollapsed && (
                  <div className="mt-1.5 w-10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md py-3 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg flex flex-col items-center gap-2 text-xs animate-fadeIn">
                    <button
                      onClick={() => setZoomScale((prev) => Math.min(3.0, Math.round((prev + 0.1) * 10) / 10))}
                      title="Увеличить масштаб"
                      className="p-1 rounded-full hover:bg-white/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    {/* Scale Slider */}
                    <div className="h-18 flex items-center justify-center my-0.5">
                      <input
                        type="range"
                        min="50"
                        max="300"
                        step="10"
                        value={Math.round(zoomScale * 100)}
                        onChange={(e) => setZoomScale(Number(e.target.value) / 100)}
                        className="h-16 w-1.5 accent-[var(--primary-accent,#8C52D0)] cursor-pointer appearance-none bg-zinc-200/80 dark:bg-zinc-700/80 rounded-full [writing-mode:vertical-lr] [direction:rtl]"
                        title="Слайдер масштаба"
                      />
                    </div>

                    <button
                      onClick={() => setZoomScale((prev) => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10))}
                      title="Уменьшить масштаб"
                      className="p-1 rounded-full hover:bg-white/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-4 h-[1px] bg-zinc-300/60 dark:bg-zinc-700/60 my-0.5" />

                    <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-300 select-none">
                      {Math.round(zoomScale * 100)}%
                    </span>

                    {zoomScale !== 1 && (
                      <button
                        onClick={() => {
                          setZoomScale(1.0);
                          setPanOffset({ x: 0, y: 0 });
                        }}
                        title="Сбросить масштаб и положение"
                        className="p-1 rounded-full hover:bg-white/80 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[var(--primary-accent,#8C52D0)] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Interactive Lower-Left Scale Slider Popover for Color Correction (Brightness, Contrast, Saturation) */}
              {activeRightTab === 'adjust' && activeAdjustTool && (
                <div className="absolute bottom-14 sm:bottom-16 left-3 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3.5 py-2.5 rounded-2xl sm:rounded-3xl border border-white/60 dark:border-zinc-700/60 shadow-xl flex flex-col gap-2 min-w-[200px] sm:min-w-[220px] animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {activeAdjustTool === 'brightness' && <Sun className="w-3.5 h-3.5 text-[var(--primary-accent,#8C52D0)]" />}
                      {activeAdjustTool === 'contrast' && <Contrast className="w-3.5 h-3.5 text-[var(--primary-accent,#8C52D0)]" />}
                      {activeAdjustTool === 'saturation' && <Droplet className="w-3.5 h-3.5 text-[var(--primary-accent,#8C52D0)]" />}
                      <span>
                        {activeAdjustTool === 'brightness' && 'Яркость'}
                        {activeAdjustTool === 'contrast' && 'Контрастность'}
                        {activeAdjustTool === 'saturation' && 'Насыщенность'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                        {activeAdjustTool === 'brightness' && `${brightness}%`}
                        {activeAdjustTool === 'contrast' && `${contrast}%`}
                        {activeAdjustTool === 'saturation' && `${saturation}%`}
                      </span>
                      <button
                        onClick={() => setActiveAdjustTool(null)}
                        className="p-1 rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        title="Закрыть шкалу"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Range Slider + Stepper Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (activeAdjustTool === 'brightness') setBrightness((prev) => Math.max(50, prev - 5));
                        if (activeAdjustTool === 'contrast') setContrast((prev) => Math.max(50, prev - 5));
                        if (activeAdjustTool === 'saturation') setSaturation((prev) => Math.max(0, prev - 5));
                      }}
                      className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer shadow-2xs"
                      title="Уменьшить"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <input
                      type="range"
                      min={activeAdjustTool === 'saturation' ? 0 : 50}
                      max={activeAdjustTool === 'saturation' ? 200 : 150}
                      value={
                        activeAdjustTool === 'brightness'
                          ? brightness
                          : activeAdjustTool === 'contrast'
                          ? contrast
                          : saturation
                      }
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (activeAdjustTool === 'brightness') setBrightness(val);
                        else if (activeAdjustTool === 'contrast') setContrast(val);
                        else if (activeAdjustTool === 'saturation') setSaturation(val);
                      }}
                      className="flex-1 accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200/80 dark:bg-zinc-700/80 rounded-full"
                    />

                    <button
                      onClick={() => {
                        if (activeAdjustTool === 'brightness') setBrightness((prev) => Math.min(150, prev + 5));
                        if (activeAdjustTool === 'contrast') setContrast((prev) => Math.min(150, prev + 5));
                        if (activeAdjustTool === 'saturation') setSaturation((prev) => Math.min(200, prev + 5));
                      }}
                      className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer shadow-2xs"
                      title="Увеличить"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Quick Preset / Reset to 100% */}
                  <div className="flex justify-between items-center pt-1 border-t border-zinc-200/40 dark:border-zinc-700/40">
                    <button
                      onClick={() => {
                        if (activeAdjustTool === 'brightness') setBrightness(100);
                        if (activeAdjustTool === 'contrast') setContrast(100);
                        if (activeAdjustTool === 'saturation') setSaturation(100);
                      }}
                      className="text-[10px] text-zinc-500 hover:text-[var(--primary-accent,#8C52D0)] flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>100%</span>
                    </button>

                    <button
                      onClick={() => setActiveAdjustTool(null)}
                      className="text-[10px] text-[var(--primary-accent,#8C52D0)] font-semibold cursor-pointer px-2 py-0.5 rounded-full hover:bg-[var(--lavenderSoft)] transition-colors"
                    >
                      Готово
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Lower-Left Scale Slider Popover for Effects (Shadow / Outline) */}
              {activeRightTab === 'effects' && activeEffectTool && (
                <div className="absolute bottom-14 sm:bottom-16 left-3 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3.5 py-2.5 rounded-2xl sm:rounded-3xl border border-white/60 dark:border-zinc-700/60 shadow-xl flex flex-col gap-2 min-w-[200px] sm:min-w-[220px] animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {activeEffectTool === 'shadow' ? (
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--primary-accent,#8C52D0)]" />
                      ) : (
                        <Layers className="w-3.5 h-3.5 text-[var(--primary-accent,#8C52D0)]" />
                      )}
                      <span>
                        {activeEffectTool === 'shadow' ? 'Параметры тени' : 'Толщина обводки'}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveEffectTool(null)}
                      className="p-1 rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      title="Закрыть шкалу"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {activeEffectTool === 'shadow' && (
                    <div className="space-y-2">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-zinc-600 dark:text-zinc-300">
                          <span>Прозрачность</span>
                          <span>{shadowOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={shadowOpacity}
                          onChange={(e) => setShadowOpacity(Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200/80 dark:bg-zinc-700/80 rounded-full"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-zinc-600 dark:text-zinc-300">
                          <span>Размытие</span>
                          <span>{shadowBlur} px</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="60"
                          value={shadowBlur}
                          onChange={(e) => setShadowBlur(Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200/80 dark:bg-zinc-700/80 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {activeEffectTool === 'outline' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-600 dark:text-zinc-300">
                        <span>Толщина</span>
                        <span>{outlineSize} px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={outlineSize}
                        onChange={(e) => setOutlineSize(Number(e.target.value))}
                        className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer h-1.5 bg-zinc-200/80 dark:bg-zinc-700/80 rounded-full"
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-1 border-t border-zinc-200/40 dark:border-zinc-700/40">
                    <button
                      onClick={() => setActiveEffectTool(null)}
                      className="text-[10px] text-[var(--primary-accent,#8C52D0)] font-semibold cursor-pointer px-2 py-0.5 rounded-full hover:bg-[var(--lavenderSoft)] transition-colors"
                    >
                      Готово
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Quick Action Overlay Bar directly over Canvas bottom */}
              <div className="absolute bottom-3 left-3 right-14 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-[calc(100%-4.5rem)] sm:max-w-md bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 dark:border-zinc-700/50 shadow-lg flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {/* TAB 1: REMOVAL QUICK ACTIONS */}
                {activeRightTab === 'removal' && (
                  <>
                    <button
                      onClick={handleCutout}
                      disabled={isProcessingCutout}
                      className="px-3 py-1 rounded-full text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md active:scale-95 disabled:opacity-50 hover:opacity-95 transition-all"
                      style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                      title="Вырезать объект"
                    >
                      {isProcessingCutout ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Scissors className="w-3.5 h-3.5" />
                      )}
                      <span className="whitespace-nowrap">Вырезать</span>
                    </button>

                    <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 shrink-0 mx-0.5" />

                    <button
                      onClick={() => setActiveTool('erase')}
                      title="Ластик — стереть фон / лишнее"
                      className={`p-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 ${
                        activeTool === 'erase'
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-2xs scale-105'
                          : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setActiveTool('restore')}
                      title="Кисть — восстановить детали"
                      className={`p-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 ${
                        activeTool === 'restore'
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-2xs scale-105'
                          : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Paintbrush className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setActiveTool('wand')}
                      title="Волшебная палочка — клик по фону"
                      className={`p-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 ${
                        activeTool === 'wand'
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-2xs scale-105'
                          : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {/* TAB 2: CROP QUICK ACTIONS */}
                {activeRightTab === 'crop' && (
                  <>
                    <button
                      onClick={handleAutoFitCrop}
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs active:scale-95"
                      title="Авто-обрезка"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[var(--primary-accent,#8C52D0)]" />
                      <span className="whitespace-nowrap">Авто-поля</span>
                    </button>

                    <button
                      onClick={() => handleApplyCropRatioPreset('1:1')}
                      className="px-2 py-1 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold shrink-0 cursor-pointer shadow-2xs"
                    >
                      1:1
                    </button>

                    <button
                      onClick={() => handleApplyCropRatioPreset('4:3')}
                      className="px-2 py-1 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold shrink-0 cursor-pointer shadow-2xs"
                    >
                      4:3
                    </button>

                    <button
                      onClick={() => handleApplyCropRatioPreset('16:9')}
                      className="px-2 py-1 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold shrink-0 cursor-pointer shadow-2xs"
                    >
                      16:9
                    </button>
                  </>
                )}

                {/* TAB 3: EFFECTS QUICK ACTIONS */}
                {activeRightTab === 'effects' && (
                  <>
                    <button
                      onClick={() => {
                        const next = !hasShadow;
                        setHasShadow(next);
                        if (next) setActiveEffectTool('shadow');
                        else if (activeEffectTool === 'shadow') setActiveEffectTool(null);
                      }}
                      className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                        hasShadow
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] border-[var(--primary-accent,#8C52D0)] shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                      }`}
                      title="Включить / настроить падающую тень"
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap">Тень</span>
                    </button>

                    {hasShadow && (
                      <button
                        onClick={() => setActiveEffectTool(activeEffectTool === 'shadow' ? null : 'shadow')}
                        title="Шкала параметров тени"
                        className={`p-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 ${
                          activeEffectTool === 'shadow'
                            ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-2xs scale-105'
                            : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 shrink-0 mx-0.5" />

                    <button
                      onClick={() => {
                        const next = !hasOutline;
                        setHasOutline(next);
                        if (next) setActiveEffectTool('outline');
                        else if (activeEffectTool === 'outline') setActiveEffectTool(null);
                      }}
                      className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                        hasOutline
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] border-[var(--primary-accent,#8C52D0)] shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                      }`}
                      title="Включить / настроить контур"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap">Обводка</span>
                    </button>

                    {hasOutline && (
                      <button
                        onClick={() => setActiveEffectTool(activeEffectTool === 'outline' ? null : 'outline')}
                        title="Шкала толщины обводки"
                        className={`p-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 ${
                          activeEffectTool === 'outline'
                            ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-2xs scale-105'
                            : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}

                {/* TAB 4: ADJUSTMENTS QUICK ACTIONS */}
                {activeRightTab === 'adjust' && (
                  <>
                    {/* 1. Brightness Icon */}
                    <button
                      onClick={() => setActiveAdjustTool(activeAdjustTool === 'brightness' ? null : 'brightness')}
                      title={`Яркость: ${brightness}% (нажмите для настройки)`}
                      className={`p-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                        activeAdjustTool === 'brightness' || brightness !== 100
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-2xs scale-105'
                          : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                    </button>

                    {/* 2. Contrast Icon */}
                    <button
                      onClick={() => setActiveAdjustTool(activeAdjustTool === 'contrast' ? null : 'contrast')}
                      title={`Контраст: ${contrast}% (нажмите для настройки)`}
                      className={`p-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                        activeAdjustTool === 'contrast' || contrast !== 100
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-2xs scale-105'
                          : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Contrast className="w-3.5 h-3.5" />
                    </button>

                    {/* 3. Saturation Icon */}
                    <button
                      onClick={() => setActiveAdjustTool(activeAdjustTool === 'saturation' ? null : 'saturation')}
                      title={`Насыщенность: ${saturation}% (нажмите для настройки)`}
                      className={`p-1.5 rounded-full text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                        activeAdjustTool === 'saturation' || saturation !== 100
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-2xs scale-105'
                          : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Droplet className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 shrink-0 mx-0.5" />

                    {/* Presets */}
                    <button
                      onClick={() => handleApplyColorPreset('vibrant')}
                      className="px-2 py-1 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold shrink-0 cursor-pointer shadow-2xs"
                      title="Пресет: Сочный цвет"
                    >
                      Сочный
                    </button>

                    <button
                      onClick={() => handleApplyColorPreset('warm')}
                      className="px-2 py-1 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold shrink-0 cursor-pointer shadow-2xs"
                      title="Пресет: Теплый тон"
                    >
                      Теплый
                    </button>

                    {(brightness !== 100 || contrast !== 100 || saturation !== 100) && (
                      <button
                        onClick={() => handleApplyColorPreset('default')}
                        title="Сбросить все цвета на 100%"
                        className="p-1 rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[var(--primary-accent,#8C52D0)] transition-colors cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Standalone Round Apply Button (Bottom Right Corner) */}
              <button
                onClick={handleUniversalApply}
                disabled={isProcessingCutout}
                title="Применить изменения"
                className="absolute bottom-3 right-3 z-40 p-2.5 hover:opacity-95 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
              >
                <Check className="w-4 h-4 text-white" />
              </button>

              {/* AI Processing Scanner Effect on viewport canvas when cutting out */}
              {isProcessingCutout && (
                <div className="absolute inset-0 z-30 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none bg-black/25 backdrop-blur-[1px] flex flex-col justify-between">
                  {/* Moving Laser Beam */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#985DE0] to-transparent shadow-[0_0_20px_#8C52D0,0_0_35px_#8C52D0] animate-scanline">
                    <div className="w-full h-16 -mt-16 bg-gradient-to-b from-transparent via-[#8C52D0]/30 to-transparent" />
                  </div>

                  {/* Scanner Overlay Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8c52d020_1px,transparent_1px),linear-gradient(to_bottom,#8c52d020_1px,transparent_1px)] bg-[size:20px_20px] opacity-70" />

                  {/* Center Status Badge - Fixed size on screen regardless of zoom */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-[var(--lavenderAccent)]/60 backdrop-blur-md flex items-center gap-2.5 animate-pulse z-40">
                    <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
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
                  className={`max-w-full max-h-[480px] object-contain shadow-lg rounded-xl ${
                    activeTool === 'erase' || activeTool === 'restore'
                      ? 'cursor-none'
                      : activeTool === 'wand'
                      ? 'cursor-crosshair'
                      : 'cursor-default'
                  }`}
                />

                {/* FULLY INTERACTIVE TOUCH & MOUSE CANVASCROP FRAME */}
                {activeRightTab === 'crop' && (
                  <div
                    ref={cropContainerRef}
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                    className="absolute inset-0 touch-none select-none z-20 rounded-xl overflow-hidden cursor-crosshair"
                  >
                    {/* Darkened Cropped Regions Outside Active Crop Frame */}
                    <div className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-[1px]" style={{ height: `${cropTop}%` }} />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-[1px]" style={{ height: `${cropBottom}%` }} />
                    <div className="absolute top-0 bottom-0 left-0 bg-black/50 backdrop-blur-[1px]" style={{ width: `${cropLeft}%`, top: `${cropTop}%`, bottom: `${cropBottom}%` }} />
                    <div className="absolute top-0 bottom-0 right-0 bg-black/50 backdrop-blur-[1px]" style={{ width: `${cropRight}%`, top: `${cropTop}%`, bottom: `${cropBottom}%` }} />

                    {/* Active Crop Box with 3x3 Grid Lines */}
                    <div
                      className="absolute shadow-2xl transition-shadow"
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
                        <div className="border-r border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div className="border-r border-white/60" style={{ borderWidth: `${1 / zoomScale}px` }} />
                        <div />
                      </div>

                      {/* Dimension Badge Pill Above Frame - Counter scaled */}
                      <div
                        className="absolute -top-7 left-1/2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1 border border-white/20"
                        style={{
                          transform: `translateX(-50%) scale(${1 / zoomScale})`,
                          transformOrigin: 'bottom center'
                        }}
                      >
                        <span>Ш: {Math.round(100 - cropLeft - cropRight)}%</span>
                        <span>•</span>
                        <span>В: {Math.round(100 - cropTop - cropBottom)}%</span>
                      </div>

                      {/* CORNER HANDLES */}
                      {/* Top-Left Corner Handle */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('tl', e)}
                        className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-30 touch-none"
                      >
                        <div
                          className="w-4 h-4 bg-white border-2 rounded-sm shadow-lg hover:scale-125 transition-transform"
                          style={{ borderColor: 'var(--primary-accent, #8C52D0)', transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* Top-Right Corner Handle */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('tr', e)}
                        className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-30 touch-none"
                      >
                        <div
                          className="w-4 h-4 bg-white border-2 rounded-sm shadow-lg hover:scale-125 transition-transform"
                          style={{ borderColor: 'var(--primary-accent, #8C52D0)', transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* Bottom-Left Corner Handle */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('bl', e)}
                        className="absolute -bottom-3 -left-3 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-30 touch-none"
                      >
                        <div
                          className="w-4 h-4 bg-white border-2 rounded-sm shadow-lg hover:scale-125 transition-transform"
                          style={{ borderColor: 'var(--primary-accent, #8C52D0)', transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* Bottom-Right Corner Handle */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('br', e)}
                        className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-30 touch-none"
                      >
                        <div
                          className="w-4 h-4 bg-white border-2 rounded-sm shadow-lg hover:scale-125 transition-transform"
                          style={{ borderColor: 'var(--primary-accent, #8C52D0)', transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* EDGE MIDDLE PILL HANDLES */}
                      {/* Top Middle Handle */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('top', e)}
                        className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-5 flex items-center justify-center cursor-ns-resize z-30 touch-none"
                      >
                        <div
                          className="w-7 h-2 bg-white border rounded-full shadow-md hover:scale-110 transition-transform"
                          style={{ borderColor: 'var(--primary-accent, #8C52D0)', transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* Bottom Middle Handle */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('bottom', e)}
                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-10 h-5 flex items-center justify-center cursor-ns-resize z-30 touch-none"
                      >
                        <div
                          className="w-7 h-2 bg-white border rounded-full shadow-md hover:scale-110 transition-transform"
                          style={{ borderColor: 'var(--primary-accent, #8C52D0)', transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* Left Middle Handle */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('left', e)}
                        className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-10 flex items-center justify-center cursor-ew-resize z-30 touch-none"
                      >
                        <div
                          className="w-2 h-7 bg-white border rounded-full shadow-md hover:scale-110 transition-transform"
                          style={{ borderColor: 'var(--primary-accent, #8C52D0)', transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>

                      {/* Right Middle Handle */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('right', e)}
                        className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-10 flex items-center justify-center cursor-ew-resize z-30 touch-none"
                      >
                        <div
                          className="w-2 h-7 bg-white border rounded-full shadow-md hover:scale-110 transition-transform"
                          style={{ borderColor: 'var(--primary-accent, #8C52D0)', transform: `scale(${1 / zoomScale})` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pixel-Perfect Precision Eraser / Brush Cursor Overlay with Zero Margin Distortion */}
                {cursorPos && (activeTool === 'erase' || activeTool === 'restore') && activeRightTab === 'removal' && (
                  <div
                    className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                    style={{
                      left: cursorPos.x,
                      top: cursorPos.y,
                      width: Math.max(4, (brushSize / (displayCanvasRef.current?.width || 1)) * (canvasDisplayRect.width || 1)),
                      height: Math.max(4, (brushSize / (displayCanvasRef.current?.width || 1)) * (canvasDisplayRect.width || 1))
                    }}
                  >
                    {/* Exact Erasure / Restore Boundary Circle with inner/outer high contrast */}
                    <div
                      className={`w-full h-full rounded-full transition-colors ${
                        activeTool === 'erase'
                          ? 'border-[1.5px] border-rose-500 bg-rose-500/20 shadow-[0_0_0_1px_rgba(0,0,0,0.85)]'
                          : 'border-[1.5px] border-[var(--primary-accent,#8C52D0)] bg-[var(--lavenderSoft)]/50 shadow-[0_0_0_1px_rgba(0,0,0,0.85)]'
                      }`}
                    />
                    {/* Center Precision Target Micro-Crosshair */}
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

          {/* Standalone Mobile Instruments Toolbar Panel (Icon-only, directly at the bottom edge) */}
          <div className="lg:hidden bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-full border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-1.5 sm:p-2 flex items-center justify-between gap-2 shrink-0 mt-2">
            {[
              { id: 'removal', title: 'Очистка фона', icon: <Scissors className="w-5 h-5" /> },
              { id: 'crop', title: 'Кадрирование полей', icon: <CropIcon className="w-5 h-5" /> },
              { id: 'effects', title: 'Падающая тень', icon: <Sparkles className="w-5 h-5" /> },
              { id: 'adjust', title: 'Цветокоррекция', icon: <Sliders className="w-5 h-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveRightTab(tab.id as any);
                  setActiveAdjustTool(null);
                  setActiveEffectTool(null);
                }}
                title={tab.title}
                className={`flex-1 py-2.5 sm:py-3 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeRightTab === tab.id
                    ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-2xs'
                    : 'bg-white/50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/80 border border-zinc-200/40 dark:border-zinc-700/40'
                }`}
              >
                {tab.icon}
              </button>
            ))}
          </div>

          {/* RIGHT: Precision Tool Parameters Sidebar (Hidden on mobile and tablet to prevent scrolling) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-4 sm:p-5 space-y-4">
            {/* Desktop Tool Selector Tabs Header */}
            <div className="hidden lg:flex items-center justify-between gap-1 p-1.5 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-full border border-zinc-200/40 dark:border-zinc-700/40">
              {[
                { id: 'removal', title: 'Очистка фона', label: 'Вырезать', icon: <Scissors className="w-4 h-4" /> },
                { id: 'crop', title: 'Кадрирование', label: 'Кадрировать', icon: <CropIcon className="w-4 h-4" /> },
                { id: 'effects', title: 'Падающая тень', label: 'Тень', icon: <Sparkles className="w-4 h-4" /> },
                { id: 'adjust', title: 'Цветокоррекция', label: 'Цвет', icon: <Sliders className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveRightTab(tab.id as any);
                    setActiveAdjustTool(null);
                    setActiveEffectTool(null);
                  }}
                  title={tab.title}
                  className={`flex-1 py-2 px-1 rounded-full flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeRightTab === tab.id
                      ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] font-semibold shadow-2xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[10px] xl:text-[11px] font-semibold leading-none tracking-tight text-center">{tab.label}</span>
                </button>
              ))}
            </div>
            {/* Active Tool Section Title */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-xl text-[var(--primary-accent,#8C52D0)] bg-[var(--lavenderSoft)]"
                >
                  {activeRightTab === 'removal' && <Scissors className="w-4 h-4" />}
                  {activeRightTab === 'crop' && <CropIcon className="w-4 h-4" />}
                  {activeRightTab === 'effects' && <Sparkles className="w-4 h-4" />}
                  {activeRightTab === 'adjust' && <Sliders className="w-4 h-4" />}
                </div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {activeRightTab === 'removal' && 'Очистка и вырезание фона'}
                  {activeRightTab === 'crop' && 'Кадрирование полей'}
                  {activeRightTab === 'effects' && 'Падающая тень'}
                  {activeRightTab === 'adjust' && 'Цветокоррекция'}
                </span>
              </div>
            </div>

            {/* TAB 1: UNIFIED AI CUTOUT & MANUAL CORRECTION */}
            {activeRightTab === 'removal' && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                {/* Primary Direct Cut Out Button */}
                <button
                  onClick={handleCutout}
                  disabled={isProcessingCutout}
                  className="w-full py-3 px-4 rounded-full hover:opacity-95 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                >
                  {isProcessingCutout ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Scissors className="w-4 h-4" />
                  )}
                  <span>{isProcessingCutout ? 'Вырезание объекта...' : 'Вырезать'}</span>
                </button>

                {/* Manual Refinement Section */}
                <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-3">
                  <div className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Ручная корректировка
                  </div>

                  {/* Tool Buttons: Eraser first, then Brush (Restore), then Wand */}
                  <div className="flex items-center justify-center gap-3 py-1">
                    <button
                      onClick={() => setActiveTool('erase')}
                      title="Ластик — стереть фон (- удалить лишнее)"
                      className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        activeTool === 'erase'
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-xs scale-105'
                          : 'bg-white/60 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      <Eraser className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setActiveTool('restore')}
                      title="Кисть — восстановить детали (+ вернуть)"
                      className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        activeTool === 'restore'
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-xs scale-105'
                          : 'bg-white/60 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      <Paintbrush className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setActiveTool('wand')}
                      title="Волшебная палочка — клик по области фона"
                      className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        activeTool === 'wand'
                          ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent,#8C52D0)] dark:text-[var(--lavenderAccent)] shadow-xs scale-105'
                          : 'bg-white/60 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      <Wand2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sliders */}
                  {(activeTool === 'erase' || activeTool === 'restore') && (
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                          <span>Размер кисти</span>
                          <span>{brushSize} px</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="120"
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                          <span>Жесткость краев</span>
                          <span>{brushHardness}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={brushHardness}
                          onChange={(e) => setBrushHardness(Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                      <span>Чувствительность (Допуск)</span>
                      <span>{tolerance}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      value={tolerance}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTolerance(val);
                        const origCanvas = originalCanvasRef.current;
                        const maskCanvas = maskCanvasRef.current;
                        if (origCanvas && maskCanvas) {
                          performAutoBackgroundRemoval(origCanvas, maskCanvas, val);
                        }
                      }}
                      className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Reset Action Button */}
                <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <button
                    onClick={handleResetToOriginal}
                    className="w-full py-2.5 px-4 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Сбросить до оригинала</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CROP TOOL (Кадрирование) */}
            {activeRightTab === 'crop' && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                {/* Auto-Fit Crop Action Button */}
                <button
                  onClick={handleAutoFitCrop}
                  className="w-full py-2.5 px-4 rounded-full hover:opacity-95 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Авто-обрезка пустых полей</span>
                </button>

                {/* Aspect Ratio Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                    Пропорции кадра:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'free', label: 'Свободно' },
                      { id: '1:1', label: '1 : 1' },
                      { id: '4:3', label: '4 : 3' },
                      { id: '16:9', label: '16 : 9' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyCropRatioPreset(p.id as any)}
                        className="py-1.5 text-[11px] font-semibold rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-white text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer text-center shadow-xs"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Directional Edge Adjustments Grid */}
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Top */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <span>↑ Сверху</span>
                        <span>{Math.round(cropTop)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="48"
                        value={cropTop}
                        onChange={(e) => handleCropChange('top', Number(e.target.value))}
                        className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                      />
                    </div>

                    {/* Bottom */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <span>↓ Снизу</span>
                        <span>{Math.round(cropBottom)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="48"
                        value={cropBottom}
                        onChange={(e) => handleCropChange('bottom', Number(e.target.value))}
                        className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                      />
                    </div>

                    {/* Left */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <span>← Слева</span>
                        <span>{Math.round(cropLeft)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="48"
                        value={cropLeft}
                        onChange={(e) => handleCropChange('left', Number(e.target.value))}
                        className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                      />
                    </div>

                    {/* Right */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <span>→ Справа</span>
                        <span>{Math.round(cropRight)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="48"
                        value={cropRight}
                        onChange={(e) => handleCropChange('right', Number(e.target.value))}
                        className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Apply / Reset Buttons */}
                <div className="flex gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <button
                    onClick={() => {
                      setCropLeft(0);
                      setCropRight(0);
                      setCropTop(0);
                      setCropBottom(0);
                    }}
                    className="flex-1 py-2 px-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    Сбросить
                  </button>
                  <button
                    onClick={handleApplyCrop}
                    className="flex-1 py-2 px-3 rounded-full text-white text-xs font-semibold shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Обрезать края</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SHADOWS & OUTLINES */}
            {activeRightTab === 'effects' && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                {/* Floor Drop Shadow Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Напольная естественно падающая тень
                    </span>
                    <input
                      type="checkbox"
                      checked={hasShadow}
                      onChange={(e) => setHasShadow(e.target.checked)}
                      className="w-4 h-4 accent-[var(--primary-accent,#8C52D0)] rounded cursor-pointer"
                    />
                  </div>

                  {hasShadow && (
                    <div className="space-y-3 pt-2 border-t border-zinc-200/40 dark:border-zinc-700/40">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300">
                          <span>Прозрачность тени</span>
                          <span>{shadowOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={shadowOpacity}
                          onChange={(e) => setShadowOpacity(Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300">
                          <span>Размытие (Blur)</span>
                          <span>{shadowBlur} px</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="60"
                          value={shadowBlur}
                          onChange={(e) => setShadowBlur(Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300">
                          <span>Смещение по вертикали</span>
                          <span>{shadowOffsetY} px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={shadowOffsetY}
                          onChange={(e) => setShadowOffsetY(Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Edge Outline / Sticker Effect */}
                <div className="space-y-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Белая обводка (Контур-наклейка)
                    </span>
                    <input
                      type="checkbox"
                      checked={hasOutline}
                      onChange={(e) => setHasOutline(e.target.checked)}
                      className="w-4 h-4 accent-[var(--primary-accent,#8C52D0)] rounded cursor-pointer"
                    />
                  </div>

                  {hasOutline && (
                    <div className="space-y-2 pt-2 border-t border-zinc-200/40 dark:border-zinc-700/40">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-300">
                          <span>Толщина контура</span>
                          <span>{outlineSize} px</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={outlineSize}
                          onChange={(e) => setOutlineSize(Number(e.target.value))}
                          className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <button
                    onClick={handleUniversalApply}
                    className="w-full py-2.5 px-4 rounded-full hover:opacity-95 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                  >
                    <Check className="w-4 h-4" />
                    <span>Применить эффект</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: ADJUSTMENTS (Яркость, Контраст) */}
            {activeRightTab === 'adjust' && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                {/* Color Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Готовые пресеты цвета:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'default', label: '100%' },
                      { id: 'vibrant', label: 'Сочный' },
                      { id: 'warm', label: 'Теплый' },
                      { id: 'studio', label: 'Студия' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyColorPreset(p.id as any)}
                        className="py-1.5 text-[11px] font-semibold rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-white text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer text-center shadow-xs hover:border-[var(--primary-accent,#8C52D0)]"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                      <span>Яркость</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                      <span>Контрастность</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                      <span>Насыщенность</span>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-[var(--primary-accent,#8C52D0)] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <button
                    onClick={handleUniversalApply}
                    className="w-full py-2.5 px-4 rounded-full hover:opacity-95 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                  >
                    <Check className="w-4 h-4" />
                    <span>Применить настройки</span>
                  </button>
                </div>
              </div>
            )}
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
