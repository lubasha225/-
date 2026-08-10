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
}

// Flatten CATALOG_ASSETS for fast lookup
const ALL_CATALOG_ITEMS: LibraryItem[] = Object.values(CATALOG_ASSETS).flat();

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
  showHuman = true
}) => {
  // If explicitly uploaded custom photo (and not unsplash placeholder), render real photo
  if (image && !image.includes('unsplash')) {
    return (
      <div className={`relative w-full h-full bg-zinc-900 ${className}`}>
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white z-20 pointer-events-none">
          <span className="text-[10px] font-mono tracking-wider opacity-90 block text-purple-200">
            {title.toUpperCase()}
          </span>
          <p className="text-xs font-semibold tracking-tight">{subtitle}</p>
        </div>
      </div>
    );
  }

  // Extract elements from scene
  const rawElements = elements || sceneData?.elements;
  const activeElements = (Array.isArray(rawElements) && rawElements.length > 0)
    ? rawElements
    : getDefaultSceneElements(sceneIndex);

  const backdropBg = sceneData?.backdropColor || '#f8f9fc';

  // Standard canvas coordinate system (600px width x 360px height)
  const canvasW = 600;
  const canvasH = 360;

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

        {/* Ground / Horizon Line */}
        <line x1="0" y1="78%" x2="100%" y2="78%" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />

        {/* Top Scale Ruler */}
        <line x1="15%" y1="7%" x2="85%" y2="7%" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="15%" y1="5%" x2="15%" y2="9%" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="50%" y1="5%" x2="50%" y2="9%" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="85%" y1="5%" x2="85%" y2="9%" stroke="#cbd5e1" strokeWidth="1" />
        <text x="50%" y="5.5%" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">
          6.00 м
        </text>
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

          // CSS Percentages relative to canvas coordinate space (600 x 360)
          const leftPct = (elX / canvasW) * 100;
          const topPct = (elY / canvasH) * 100;
          const widthPct = (elW / canvasW) * 100;
          const heightPct = (elH / canvasH) * 100;

          const svgContent = getElementSvgMarkup(el);

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
                transform: `rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1}) scaleY(${isFlippedV ? -1 : 1})`
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

      {/* Human Metric Scale Silhouette ("Человеческий элемент") */}
      {showHuman && (
        <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Human Silhouette placed on floor baseline on left side */}
          <g transform="translate(30, 155) scale(0.85)">
            {/* Person silhouette */}
            <path
              d="M 25 15 C 31 15 35 11 35 5 C 35 -1 31 -5 25 -5 C 19 -5 15 -1 15 5 C 15 11 19 15 25 15 Z M 16 22 L 8 65 L 17 65 L 21 38 L 23 100 L 28 100 L 29 45 L 30 100 L 35 100 L 37 38 L 41 65 L 50 65 L 42 22 C 37 18 21 18 16 22 Z"
              fill="#818cf8"
              opacity="0.85"
            />
            {/* Height dimension guide line */}
            <line x1="58" y1="-5" x2="58" y2="100" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="53" y1="-5" x2="63" y2="-5" stroke="#6366f1" strokeWidth="1" />
            <line x1="53" y1="100" x2="63" y2="100" stroke="#6366f1" strokeWidth="1" />
            <text x="65" y="52" fill="#4f46e5" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
              1.70м
            </text>
          </g>
        </svg>
      )}

      {/* Bottom Title & Subtitle Banner */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white z-30 pointer-events-none">
        <span className="text-[10px] font-mono tracking-wider opacity-90 block text-purple-200">
          {title.toUpperCase()}
        </span>
        <p className="text-xs font-semibold tracking-tight">{subtitle}</p>
      </div>
    </div>
  );
};
