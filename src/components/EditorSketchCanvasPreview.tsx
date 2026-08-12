import React from 'react';
import { CATALOG_ASSETS, LibraryItem } from './editor/EditorLibraryData';

export interface EditorSketchCanvasPreviewProps {
  title?: string;
  subtitle?: string;
  sceneIndex?: number;
  image?: string;
  sceneData?: any;
  elements?: any[];
  className?: string;
  showHuman?: boolean;
  hideBanner?: boolean;
}

// Flatten CATALOG_ASSETS for fast lookup
const ALL_CATALOG_ITEMS: LibraryItem[] = Object.values(CATALOG_ASSETS).flat();

const hexToRgba = (hex: string = '#000000', alpha: number = 0.5) => {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
};

/**
 * Resolves the SVG markup or image URL for a given element from scene
 */
function getElementSvgMarkup(el: any): string {
  if (el.svgMarkup) return el.svgMarkup;

  const searchKey = `${el.code || ''} ${el.id || ''} ${el.name || ''} ${el.type || ''} ${el.category || ''}`.toLowerCase();

  // 1. Try exact code/id match
  let matched = ALL_CATALOG_ITEMS.find((item) => {
    const itemCode = item.code.toLowerCase();
    const itemId = item.id.toLowerCase();
    return searchKey.includes(itemCode) || searchKey.includes(itemId);
  });

  // 2. Try name match
  if (!matched && el.name) {
    const nameLower = el.name.toLowerCase();
    matched = ALL_CATALOG_ITEMS.find((item) => item.name.toLowerCase().includes(nameLower) || nameLower.includes(item.name.toLowerCase()));
  }

  if (matched?.svgMarkup) return matched.svgMarkup;

  // 3. Fallback by category/type
  const typeLower = `${el.type || ''} ${el.category || ''}`.toLowerCase();
  if (typeLower.includes('arch') || typeLower.includes('арк')) return CATALOG_ASSETS.arches[0].svgMarkup;
  if (typeLower.includes('flow') || typeLower.includes('флор') || typeLower.includes('цвет')) return CATALOG_ASSETS.flowers[0].svgMarkup;
  if (typeLower.includes('light') || typeLower.includes('свет') || typeLower.includes('освещ')) return CATALOG_ASSETS.light[0].svgMarkup;
  if (typeLower.includes('table') || typeLower.includes('стол') || typeLower.includes('мебел')) return CATALOG_ASSETS.tables[0].svgMarkup;
  if (typeLower.includes('stand') || typeLower.includes('стойк') || typeLower.includes('подиум')) return CATALOG_ASSETS.stands[0].svgMarkup;
  if (typeLower.includes('balloon') || typeLower.includes('шар')) return CATALOG_ASSETS.balloons[0].svgMarkup;
  if (typeLower.includes('textile') || typeLower.includes('текстиль')) return CATALOG_ASSETS.textiles[0].svgMarkup;
  if (typeLower.includes('decor') || typeLower.includes('декор')) return CATALOG_ASSETS.decor[0].svgMarkup;

  return CATALOG_ASSETS.arches[0].svgMarkup;
}

/**
 * Default element sets if scene has no stored elements
 */
function getDefaultSceneElements(sceneIndex: number): any[] {
  const variant = Math.abs(sceneIndex) % 3;

  if (variant === 0) {
    // Scene 1: Arch + Flowers + Stand
    return [
      {
        id: 'def-arch-1',
        name: 'Круглая арка «Оливия»',
        type: 'arches',
        x: 180,
        y: 40,
        w: 240,
        h: 240,
        rotation: 0,
        svgMarkup: CATALOG_ASSETS.arches[0].svgMarkup
      },
      {
        id: 'def-flower-1',
        name: 'Гирлянда из роз',
        type: 'flowers',
        x: 150,
        y: 20,
        w: 300,
        h: 80,
        rotation: 0,
        svgMarkup: CATALOG_ASSETS.flowers[0].svgMarkup
      },
      {
        id: 'def-stand-1',
        name: 'Золотая стойка',
        type: 'stands',
        x: 100,
        y: 160,
        w: 70,
        h: 120,
        rotation: 0,
        svgMarkup: CATALOG_ASSETS.stands[0].svgMarkup
      }
    ];
  }

  if (variant === 1) {
    // Scene 2: Presidium Portal + Table + Candles
    return [
      {
        id: 'def-portal-2',
        name: 'Портал Президиум',
        type: 'arches',
        x: 140,
        y: 30,
        w: 320,
        h: 240,
        rotation: 0,
        svgMarkup: CATALOG_ASSETS.arches[2].svgMarkup
      },
      {
        id: 'def-table-2',
        name: 'Стол молодоженов',
        type: 'tables',
        x: 170,
        y: 190,
        w: 260,
        h: 90,
        rotation: 0,
        svgMarkup: CATALOG_ASSETS.tables[0].svgMarkup
      },
      {
        id: 'def-candle-2',
        name: 'Напольный канделябр',
        type: 'light',
        x: 100,
        y: 150,
        w: 50,
        h: 130,
        rotation: 0,
        svgMarkup: CATALOG_ASSETS.light[0].svgMarkup
      }
    ];
  }

  // Scene 3: Hexagon Arch + Flowers + Pedestal
  return [
    {
      id: 'def-hex-3',
      name: 'Гексагональная арка',
      type: 'arches',
      x: 170,
      y: 40,
      w: 260,
      h: 240,
      rotation: 0,
      svgMarkup: CATALOG_ASSETS.arches[3].svgMarkup
    },
    {
      id: 'def-flower-3',
      name: 'Букет на стойку',
      type: 'flowers',
      x: 130,
      y: 180,
      w: 80,
      h: 90,
      rotation: 0,
      svgMarkup: CATALOG_ASSETS.flowers[1].svgMarkup
    },
    {
      id: 'def-stand-3',
      name: 'Подиум для фотозоны',
      type: 'stands',
      x: 420,
      y: 180,
      w: 75,
      h: 100,
      rotation: 0,
      svgMarkup: CATALOG_ASSETS.stands[1].svgMarkup
    }
  ];
}

export const EditorSketchCanvasPreview: React.FC<EditorSketchCanvasPreviewProps> = ({
  title = 'ВИЗУАЛИЗАЦИЯ 1',
  subtitle = 'Концепция декор-зоны',
  sceneIndex = 0,
  image = '',
  sceneData = null,
  elements = null,
  className = '',
  showHuman = false,
  hideBanner = false
}) => {
  // If explicitly provided a preview image or captured canvas screenshot, render the real photo
  if (image && !image.includes('unsplash')) {
    return (
      <div className={`relative w-full h-full bg-[#f8f9fc] dark:bg-zinc-900 ${className}`}>
        <img src={image} alt={title} className="w-full h-full object-contain" />
        {!hideBanner && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white z-20 pointer-events-none">
            <span className="text-[10px] font-mono tracking-wider opacity-90 block text-purple-200">
              {title.toUpperCase()}
            </span>
            <p className="text-xs font-semibold tracking-tight">{subtitle}</p>
          </div>
        )}
      </div>
    );
  }

  // Extract elements from scene
  const rawElements = elements || sceneData?.elements;
  const activeElements = (Array.isArray(rawElements) && rawElements.length > 0)
    ? rawElements
    : getDefaultSceneElements(sceneIndex);

  const backdropBg = sceneData?.backdropColor || '#f8f9fc';

  // Standard canvas coordinate system (650px width x 440px height to match MoodboardEditor standard)
  const canvasW = 650;
  const canvasH = 440;

  // Only show human figure if explicitly enabled in sceneData AND showHuman prop is true
  const isHumanVisible = showHuman && !!sceneData?.humanVisible;

  return (
    <div
      className={`relative w-full h-full overflow-hidden flex flex-col justify-between select-none ${className}`}
      style={{ backgroundColor: backdropBg }}
    >
      {/* Grid Pattern Background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`preview-grid-min-${sceneIndex}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-300/40 dark:text-zinc-700/30" />
          </pattern>
          <pattern id={`preview-grid-maj-${sceneIndex}`} width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill={`url(#preview-grid-min-${sceneIndex})`} />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-400/50 dark:text-zinc-600/40" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#preview-grid-maj-${sceneIndex})`} />
      </svg>

      {/* Render Canvas Elements Container */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {activeElements.map((el: any, idx: number) => {
          const elX = typeof el.x === 'number' ? el.x : 100 + (idx * 50);
          const elY = typeof el.y === 'number' ? el.y : 60;
          const elW = typeof el.w === 'number' ? el.w : 180;
          const elH = typeof el.h === 'number' ? el.h : 180;
          const rotation = el.rotation || 0;
          const opacity = typeof el.opacity === 'number' ? el.opacity / 100 : 1;
          const isFlippedH = !!el.isFlippedH;
          const isFlippedV = !!el.isFlippedV;

          const leftPct = (elX / canvasW) * 100;
          const topPct = (elY / canvasH) * 100;
          const widthPct = (elW / canvasW) * 100;
          const heightPct = (elH / canvasH) * 100;

          const svgContent = getElementSvgMarkup(el);

          const shadowFilter = el.shadowEnabled
            ? ` drop-shadow(${el.shadowX ?? 0}px ${el.shadowY ?? 8}px ${el.shadowBlur ?? 12}px ${hexToRgba(el.shadowColor || '#000000', (el.shadowOpacity ?? 50) / 100)})`
            : '';

          return (
            <div
              key={el.id || `el-${idx}`}
              className="absolute transition-all duration-300 flex items-center justify-center"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
                opacity: opacity,
                transform: `rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1}) scaleY(${isFlippedV ? -1 : 1})`,
                filter: `brightness(${100 + (el.exposure || 0)}%) saturate(${el.saturate ?? 100}%) hue-rotate(${el.hue || 0}deg) sepia(${el.temp > 0 ? el.temp * 0.4 : 0}%)${shadowFilter}`
              }}
            >
              {el.imageUrl ? (
                <img src={el.imageUrl} alt={el.name || 'Элемент'} className="w-full h-full object-contain pointer-events-none" />
              ) : (
                <div
                  className="w-full h-full [&_svg]:w-full [&_svg]:h-full [&_svg]:block"
                  dangerouslySetInnerHTML={{
                    __html: svgContent.replace(/<svg\b([^>]*)>/i, (match, p1) => {
                      const cleanP1 = p1.replace(/\b(width|height)=["'][^"']*["']/gi, '').replace(/\bpreserveAspectRatio=["'][^"']*["']/gi, '');
                      return `<svg ${cleanP1} preserveAspectRatio="none" style="width:100%;height:100%;">`;
                    })
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Human Metric Scale Silhouette ONLY if sceneData specifically enabled it */}
      {isHumanVisible && (
        <div
          className="absolute z-20 pointer-events-none flex flex-col items-center"
          style={{
            left: `${((sceneData?.humanPos?.x || 50) / canvasW) * 100}%`,
            top: `${((sceneData?.humanPos?.y || 200) / canvasH) * 100}%`,
            width: `${((Math.round((sceneData?.humanHeightCm || 175) * (70 / 175))) / canvasW) * 100}%`,
            height: `${((sceneData?.humanHeightCm || 175) / canvasH) * 100}%`,
          }}
        >
          <svg viewBox="0 0 100 240" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
            <path
              fill="#C0D4E5"
              fillOpacity="0.88"
              stroke="#8CA8C2"
              strokeWidth="1"
              strokeLinejoin="round"
              fillRule="evenodd"
              d="
                M 50 10 C 43 10 36 15 36 25 C 35 32 38 42 34 48 C 29 50 22 55 20 62
                C 17 71 18 80 15 88 C 13 94 17 101 22 102 C 28 103 33 97 36 88
                C 37 83 36 74 38 68 C 37 82 34 100 22 162 C 20 166 23 168 28 168
                L 42 168 L 43 232 C 42 236 47 238 49 238 C 50 238 50 234 49 228
                L 48 172 L 52 172 L 51 228 C 50 234 50 238 51 238 C 53 238 58 236 57 232
                L 58 168 L 72 168 C 77 168 80 166 78 162 C 66 100 63 82 62 68
                C 64 74 63 83 64 88 C 67 97 72 103 78 102 C 83 101 87 94 85 88
                C 82 80 83 71 80 62 C 78 55 71 50 66 48 C 62 42 65 32 64 25
                C 64 15 57 10 50 10 Z
              "
            />
          </svg>
        </div>
      )}

      {/* Bottom Title & Subtitle Banner */}
      {!hideBanner && (
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white z-30 pointer-events-none">
          <span className="text-[10px] font-mono tracking-wider opacity-90 block text-purple-200">
            {title.toUpperCase()}
          </span>
          <p className="text-xs font-semibold tracking-tight">{subtitle}</p>
        </div>
      )}
    </div>
  );
};
