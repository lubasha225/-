import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Handshake, 
  Search, 
  Tag, 
  ExternalLink, 
  Lock, 
  Sparkles, 
  Check, 
  Copy, 
  Scissors, 
  MapPin, 
  Ticket, 
  RotateCcw,
  FileText
} from 'lucide-react';
import { Partner, getStoredPartners } from '../lib/partnersData';

export function TelegramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="#24A1DE"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.3999 11.9999L17.2039 7.27791C17.7519 7.07991 18.2309 7.41191 18.0539 8.21991L16.0469 17.6779C15.8979 18.3499 15.4989 18.5139 14.9369 18.1979L11.8799 15.9449L10.4049 17.3639C10.2419 17.5269 10.1059 17.6639 9.7919 17.6639L10.0119 14.5499L15.6809 9.42891C15.9279 9.20891 15.6269 9.08691 15.2979 9.30691L8.2919 13.7179L5.2759 12.7759C4.6199 12.5709 4.6069 12.1189 5.3999 11.9999Z"
        fill="white"
      />
    </svg>
  );
}

interface PartnersTabProps {
  showToast?: (title: string, message: string, type?: 'success' | 'warn' | 'info') => void;
  userTariff?: string;
}

// =========================================================================
// 1. HIGH-DPI CRISP THEMED GRADIENT SCRATCH-OFF COMPONENT
// =========================================================================
interface ScratchOffAreaProps {
  promoCode: string;
  isUnlocked: boolean;
  onReveal?: () => void;
  showToast?: (title: string, message: string, type?: 'success' | 'warn' | 'info') => void;
}

const ScratchOffArea: React.FC<ScratchOffAreaProps> = ({
  promoCode,
  isUnlocked,
  onReveal,
  showToast
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [copied, setCopied] = useState(false);

  // Draw shimmering, vibrant theme-gradient scratch layer with High-DPI scaling
  const drawPattern = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(rect.width || 280);
    const h = Math.round(rect.height || 82);

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    // Read active theme colors from document root
    const rootStyle = getComputedStyle(document.documentElement);
    const themeFrom = rootStyle.getPropertyValue('--primary-grad-from').trim() || '#8C52D0';
    const themeTo = rootStyle.getPropertyValue('--primary-grad-to').trim() || '#582F89';

    // 1. Shimmering theme gradient (as requested: "на градиенте акцентной темы")
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, themeFrom);
    grad.addColorStop(1, themeTo);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Translucent geometric circles pattern matching Container.png reference
    ctx.save();

    // Large prominent left circular disc
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.12, canvas.height * 0.45, canvas.height * 0.88, 0, Math.PI * 2);
    ctx.fill();

    // Inner overlapping secondary disc
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.38, canvas.height * 0.52, canvas.height * 0.62, 0, Math.PI * 2);
    ctx.fill();

    // Large bottom-right circular disc
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.9, canvas.height * 0.85, canvas.height * 0.78, 0, Math.PI * 2);
    ctx.fill();

    // Top-right soft circular disc
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.96, -canvas.height * 0.05, canvas.height * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 3. Clean, crisp white typography matching Container.png
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 4 * dpr;
    ctx.shadowOffsetY = 1 * dpr;

    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${Math.round(12.5 * dpr)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('Потрите защитный слой', canvas.width / 2, canvas.height / 2 - 8 * dpr);
    ctx.fillText('для открытия скидки', canvas.width / 2, canvas.height / 2 + 9 * dpr);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  };

  useEffect(() => {
    if (!isScratched) {
      drawPattern();
    }
  }, [isScratched]);

  // Redraw when container size or window resizes
  useEffect(() => {
    const handleResize = () => {
      if (!isScratched) {
        drawPattern();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isScratched]);

  const scratchAtPoint = (x: number, y: number) => {
    if (!isUnlocked) {
      showToast?.('Подписка не активна', 'Оплатите тариф IQ Deco, чтобы открывать защитный слой скидки.', 'warn');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20 * dpr, 0, Math.PI * 2);
    ctx.fill();

    checkScratchedRatio();
  };

  const checkScratchedRatio = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let transparentPixels = 0;
      const totalPixels = data.length / 4;

      for (let i = 3; i < data.length; i += 24) {
        if (data[i] < 128) {
          transparentPixels += 6;
        }
      }

      const ratio = transparentPixels / totalPixels;
      setScratchPercent(Math.round(ratio * 100));

      if (ratio > 0.38 && !isScratched) {
        setIsScratched(true);
        onReveal?.();
        showToast?.('Код открыт!', 'Защитный слой стёрт. Промокод готов к применению!', 'success');
      }
    } catch {
      // Fallback
    }
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isUnlocked) {
      showToast?.('Требуется подписка', 'Защитный слой доступен на оплаченных тарифах IQ Deco.', 'info');
      return;
    }
    setIsScratching(true);
    const { x, y } = getCanvasCoords(e);
    scratchAtPoint(x, y);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    const { x, y } = getCanvasCoords(e);
    scratchAtPoint(x, y);
  };

  const handlePointerUp = () => {
    setIsScratching(false);
  };

  const handleQuickReveal = () => {
    if (!isUnlocked) {
      showToast?.('Подписка не активна', 'Оплатите тариф IQ Deco, чтобы получить доступ к промокоду.', 'warn');
      return;
    }
    setIsScratched(true);
    onReveal?.();
    showToast?.('Промокод открыт', `Секретный код «${promoCode}» активирован!`, 'success');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    showToast?.('Скопировано!', `Промокод «${promoCode}» скопирован в буфер обмена`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative w-full select-none">
      {/* Code Container - Borderless when unscratched to eliminate dark contour */}
      <div 
        ref={containerRef}
        className={`relative rounded-2xl p-2.5 sm:p-3 transition-all flex flex-col items-center justify-center min-h-[76px] overflow-hidden ${
          isScratched 
            ? 'bg-zinc-950 dark:bg-black border border-zinc-800/80 shadow-md' 
            : 'bg-transparent border-0 shadow-none'
        }`}
      >
        {/* Subtle dark pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: '10px 10px'
          }}
        />

        {/* Revealed Code Display: Promo code text in the LIGHTEST theme color */}
        <div className="flex flex-col items-center justify-center w-full z-10 text-center">
          <span className="text-[10px] font-semibold tracking-wider uppercase mb-1 flex items-center gap-1.5 text-zinc-400">
            <Sparkles className="w-3 h-3 text-[var(--primary-grad-from)]" />
            <span>Ваш промокод</span>
          </span>

          {/* Code pill in the brightest, purest light tint of the active theme */}
          <div 
            className="font-mono text-base sm:text-lg font-black tracking-widest px-4 py-1.5 rounded-xl bg-zinc-900/95 border border-zinc-700/60 shadow-inner"
            style={{ 
              color: 'color-mix(in srgb, var(--primary-grad-from, #a855f7) 35%, white 65%)',
              textShadow: '0 0 16px rgba(255, 255, 255, 0.4), 0 0 8px var(--primary-grad-from, #a855f7)'
            }}
          >
            {promoCode}
          </div>

          {/* Copy Button in Theme Gradient */}
          <button
            onClick={handleCopyCode}
            style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
            className="mt-2 text-[10px] font-bold flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 stroke-[2.5]" />
                <span>Скопировать</span>
              </>
            )}
          </button>
        </div>

        {/* Shimmering Themed Gradient Scratch-Off Canvas Overlay (No dark contour) */}
        {!isScratched && (
          <div className="absolute inset-0 z-20 overflow-hidden rounded-2xl">
            <canvas
              ref={canvasRef}
              className={`w-full h-full cursor-pointer touch-none transition-opacity duration-300 ${
                isUnlocked ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-90'
              }`}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              title={isUnlocked ? 'Потрите защитный слой' : 'Требуется активная подписка'}
            />

            {/* Lock indicator if tariff is unpaid */}
            {!isUnlocked && (
              <div className="absolute inset-0 bg-zinc-900/85 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center text-white">
                <Lock className="w-4 h-4 text-amber-400 mb-0.5" />
                <span className="text-[10px] font-semibold text-zinc-200">Слой заблокирован</span>
                <span className="text-[8px] text-zinc-400">Только с подпиской</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auxiliary quick scratch helper button */}
      {!isScratched && isUnlocked && (
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 px-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Стерто: {scratchPercent}%</span>
          </span>
          <button
            onClick={handleQuickReveal}
            className="text-[var(--primary-accent)] dark:text-[var(--lavenderAccent)] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Потереть защитный слой</span>
          </button>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 2. MAIN PARTNERS TAB COMPONENT
// =========================================================================
export default function PartnersTab({ showToast, userTariff = 'Расширенный' }: PartnersTabProps) {
  // Subscription toggle state
  const [isSubscriptionActive, setIsSubscriptionActive] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  
  // Track which coupon cards are flipped to back side
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Dynamic partners loaded from storage and updated in real-time by Admin Cabinet
  const [partnersList, setPartnersList] = useState<Partner[]>(() => getStoredPartners());

  useEffect(() => {
    const handlePartnersSync = (e?: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setPartnersList([...e.detail]);
      } else {
        setPartnersList(getStoredPartners());
      }
    };
    window.addEventListener('storage', handlePartnersSync);
    window.addEventListener('partners_updated', handlePartnersSync as EventListener);
    window.addEventListener('focus', handlePartnersSync);
    return () => {
      window.removeEventListener('storage', handlePartnersSync);
      window.removeEventListener('partners_updated', handlePartnersSync as EventListener);
      window.removeEventListener('focus', handlePartnersSync);
    };
  }, []);

  // Compute categories dynamically based on current partners
  const categories = useMemo(() => {
    const set = new Set<string>();
    partnersList.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['Все', ...Array.from(set)];
  }, [partnersList]);

  const filteredPartners = useMemo(() => {
    return partnersList.filter(partner => {
      const matchesCategory = selectedCategory === 'Все' || partner.category === selectedCategory;
      const matchesQuery = 
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [partnersList, selectedCategory, searchQuery]);

  const handleRevealPartner = (id: string) => {
    if (!revealedIds.includes(id)) {
      setRevealedIds(prev => [...prev, id]);
    }
  };

  const toggleCardFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Real transparent coupon cutout mask style:
  // Cuts out semicircles directly from the card container at the perforation line (y: 268px)
  // so the page background naturally shows through without any solid background under them!
  const couponCardMaskStyle: React.CSSProperties = {
    WebkitMaskImage: 'radial-gradient(circle 13px at 0px 268px, transparent 13px, black 13.5px), radial-gradient(circle 13px at 100% 268px, transparent 13px, black 13.5px)',
    WebkitMaskComposite: 'destination-in',
    maskImage: 'radial-gradient(circle 13px at 0px 268px, transparent 13px, black 13.5px), radial-gradient(circle 13px at 100% 268px, transparent 13px, black 13.5px)',
    maskComposite: 'intersect',
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      
      {/* 1. TOP BANNER */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all">
        
        {/* Left cluster: Handshake icon + Lowercase title & subtitle */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-2xs border border-teal-500/20">
            <Handshake className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 lowercase">
              партнёрские скидки iq deco
            </h2>
            <p className="text-xs sm:text-sm font-normal text-zinc-600 dark:text-zinc-400 leading-relaxed lowercase max-w-xl">
              покажите персональную ссылку поставщику — она подтвердит активную подписку и откроет условия партнёров.
            </p>
          </div>
        </div>

        {/* Right cluster: Amber Notice Box */}
        <div className="flex items-center shrink-0">
          <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-800/40 rounded-2xl p-3.5 sm:p-4 flex items-start gap-2.5 max-w-md shadow-2xs">
            <div className="p-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200 font-normal leading-relaxed lowercase">
              персональная ссылка работает после оплаты подписки. карточки партнёров можно посмотреть уже сейчас.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR: CATEGORY FILTER CHIPS + SEARCH + TARIFF BADGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        
        {/* Horizontal Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={isSelected ? { background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' } : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right Search Input + Subscription status indicator */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск партнёра..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)]"
            />
          </div>

          {/* Subscription State Badge */}
          <div 
            onClick={() => {
              const next = !isSubscriptionActive;
              setIsSubscriptionActive(next);
              showToast?.(
                next ? 'Подписка активна' : 'Режим гостя (без подписки)',
                next ? 'Вам доступны все скретч-слои купонов' : 'Скретч-слои заблокированы для демонстрации',
                'info'
              );
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 cursor-pointer transition-all ${
              isSubscriptionActive
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700'
            }`}
            title="Нажмите, чтобы протестировать поведение с активной или неактивной подпиской"
          >
            {isSubscriptionActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Тариф: «{userTariff}»</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-zinc-400" />
                <span>Демо-режим</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. COUPON CARDS GRID WITH REAL CUTOUT NOTCHES & 3D FLIP EFFECT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => {
          const isFlipped = !!flippedCards[partner.id];

          return (
            <div
              key={partner.id}
              className="relative w-full h-[475px] [perspective:1400px]"
            >
              {/* 3D Rotating Card Container */}
              <div
                className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* ========================================================= */}
                {/* FRONT FACE: TICKET WITH HERO, LOGO & SCRATCH-OFF PROMO    */}
                {/* ========================================================= */}
                <div 
                  style={couponCardMaskStyle}
                  className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] bg-white/70 dark:bg-zinc-900/75 backdrop-blur-md rounded-[28px] border border-zinc-200/70 dark:border-zinc-800/70 shadow-xs hover:shadow-xl transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  {/* TICKET HEADER: VIBRANT PARTNER HERO BANNER (Fixed h-44 = 176px) */}
                  <div className="relative h-44 w-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={partner.bannerImage}
                      alt={partner.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    
                    {/* Gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

                    {/* Floating Discount Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <div className={`px-3 py-1 rounded-full text-white font-black text-xs sm:text-sm tracking-wider shadow-md bg-gradient-to-r ${partner.badgeColor || 'from-purple-500 to-indigo-600'} flex items-center gap-1`}>
                        <Tag className="w-3 h-3 stroke-[3]" />
                        <span>{partner.discount}</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-semibold border border-white/20">
                        {partner.category}
                      </span>
                    </div>

                    {/* Partner Logo Badge & Title on Banner */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Brand Logo Box with uploaded image or text logo */}
                        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-900 shadow-md p-1 border border-white/40 dark:border-zinc-700/60 flex items-center justify-center shrink-0 overflow-hidden">
                          {partner.logoUrl ? (
                            <img
                              src={partner.logoUrl}
                              alt={partner.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="font-black text-xs tracking-tight text-[var(--primary-accent)]">
                              {partner.logoText || partner.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Brand Name & Short Badge */}
                        <div className="min-w-0 text-white drop-shadow-sm">
                          <h3 className="font-extrabold text-base sm:text-lg tracking-tight leading-tight truncate">
                            {partner.name}
                          </h3>
                          <p className="text-[10px] text-zinc-300 font-medium tracking-wide uppercase truncate">
                            {partner.badgeText}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PARTNER BODY DESCRIPTION (Height aligns perforation exactly at 268px) */}
                  <div className="h-[84px] px-5 py-2.5 flex flex-col justify-between shrink-0">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal line-clamp-2">
                      {partner.shortDesc}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                      <MapPin className="w-3 h-3 shrink-0 text-zinc-400" />
                      <span className="truncate">{partner.city}</span>
                    </div>
                  </div>

                  {/* TICKET PERFORATION LINE: GENUINELY CUT OUT AT SIDES WITH SCISSORS IN CENTER */}
                  <div className="relative w-full h-[16px] my-0 flex items-center justify-center shrink-0">
                    {/* Dashed Perforation Line with scissors icon in center */}
                    <div className="w-full border-t-2 border-dashed border-zinc-300/80 dark:border-zinc-700/80 relative flex items-center justify-center">
                      <div className="absolute w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center shadow-2xs text-zinc-400 dark:text-zinc-500">
                        <Scissors className="w-3 h-3 rotate-90 stroke-[2.2]" />
                      </div>
                    </div>
                  </div>

                  {/* TICKET STUB: SCRATCH-OFF PROMO CODE AREA */}
                  <div className="px-5 pt-2.5 pb-3.5 bg-zinc-50/50 dark:bg-zinc-900/40 flex-1 flex flex-col justify-between">
                    {/* Header & Scratch Area grouped tightly */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                          <span>Купон на скидку</span>
                        </span>
                      </div>

                      {/* Scratch-Off Area */}
                      <ScratchOffArea
                        key={`${partner.id}_${partner.promoCode}`}
                        promoCode={partner.promoCode}
                        isUnlocked={isSubscriptionActive}
                        onReveal={() => handleRevealPartner(partner.id)}
                        showToast={showToast}
                      />
                    </div>

                    {/* Card Actions Footer: Compact & aligned */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                      <button
                        onClick={() => toggleCardFlip(partner.id)}
                        className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-[var(--primary-accent)] dark:hover:text-[var(--lavenderAccent)] transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Подробнее</span>
                      </button>

                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary-accent)] dark:text-[var(--lavenderAccent)] hover:underline cursor-pointer ml-auto"
                      >
                        <span>Сайт партнёра</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* BACK FACE: DETAILED CONDITIONS & PARTNER INFO             */}
                {/* ========================================================= */}
                <div 
                  style={couponCardMaskStyle}
                  className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl flex flex-col justify-between overflow-hidden p-5 sm:p-6 space-y-4"
                >
                  {/* Top Bar of Back Face: Partner Name, Category & Close/Flip Button */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center shrink-0 font-bold text-xs text-[var(--primary-accent)]">
                        {partner.logoText || partner.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {partner.name}
                        </h4>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {partner.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-500/20">
                        {partner.discount}
                      </span>
                      <button
                        onClick={() => toggleCardFlip(partner.id)}
                        className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Перевернуть обратно к купону"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Conditions Body */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar text-left select-text">
                    {/* Primary Conditions Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--primary-accent)] dark:text-[var(--lavenderAccent)]">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Условия применения скидки</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/50 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                        {partner.terms || 'Скидка действует при оформлении заказа на сайте или через менеджера компании по промокоду. Скидка не суммируется с другими специальными акциями.'}
                      </div>
                    </div>

                    {/* About Partner */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        О компании
                      </span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                        {partner.fullDesc || partner.shortDesc}
                      </p>
                    </div>

                    {/* How to activate steps */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Как воспользоваться:
                      </span>
                      <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
                        <li>Переверните купон и сотрите защитный слой</li>
                        <li>Скопируйте промокод в буфер обмена</li>
                        <li>Укажите промокод в корзине на сайте поставщика или назовите менеджеру</li>
                      </ul>
                    </div>

                    {/* City info */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{partner.city}</span>
                    </div>
                  </div>

                  {/* Back Face Actions: Flip back button + Telegram button */}
                  <div className="pt-3 pb-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2 shrink-0">
                    <button
                      onClick={() => toggleCardFlip(partner.id)}
                      className="px-3.5 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Вернуться к купону</span>
                    </button>

                    {partner.telegram && (
                      <a
                        href={partner.telegram}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-full bg-[#24A1DE]/10 hover:bg-[#24A1DE]/20 text-[#24A1DE] border border-[#24A1DE]/25 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                        title="Telegram поставщика"
                      >
                        <TelegramIcon className="w-4 h-4 shrink-0" />
                        <span>Telegram</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
