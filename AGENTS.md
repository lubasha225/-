# Инструкция по дизайну и форматированию карточек (UI Standard)

Эта инструкция описывает единый стандарт оформления карточек, заголовков, шрифтов, иконок и кнопок в проекте для всех новых и обновляемых разделов.

---

## 1. Стиль подложки (Glassmorphism Canvas)
- **Фон (Background):** `bg-white/40 dark:bg-zinc-900/30`
- **Размытие (Blur):** `backdrop-blur-md`
- **Скругление углов (Border Radius):** `rounded-[28px]` или `rounded-[32px]`
- **Рамка (Border):** `border border-zinc-200/50 dark:border-zinc-800/40` (толщина 1px)
- **Тень и отступы:** `shadow-xs p-5 sm:p-6` (внутренний padding от 20px до 28px)

---

## 2. Шрифты и заголовки

### 2.1 Главная шапка раздела
- **Заголовок (Page Title):** `text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100` (24px в мобильной версии, 32px в десктопной)
- **Описание под заголовком:** `text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed` (14px в мобильной версии, 14px в десктопной)

### 2.2 Заголовки карточек (Card Header)
- **Название карточки (Card Title):** `text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100` (размер ~16–18px, SemiBold)
- **Описание внутри карточки:** `text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed` (размер ~12–14px, Regular)

### 2.3 Метки полей (Labels)
- **Заглавные подписи полей (Uppercase Label):** 
  - Высота заглавных букв: **10px** (`text-[10px]`)
  - Начертание: **обычное** (`font-normal`)
  - Цвет: `text-zinc-600 dark:text-zinc-400`
  - Межбуквенный интервал: обычный (`tracking-normal`)

---

## 3. Иконки карточек
- **Размер иконки:** `w-5 h-5` (20×20 px)
- **Контейнер иконки:** `p-2 bg-[var(--lavenderSoft)] rounded-xl shrink-0`
- **Цвет иконки:** `text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]` (фиолетовый акцент `#8C52D0` / `#985DE0`)

---

## 4. Кнопки (Button Styles)

### 4.1 Главные кнопки (Primary)
- **Фон:** `linear-gradient(135deg, #8C52D0 0%, #582F89 100%)`
- **Форма:** полностью скругленные углы (`rounded-full`)
- **Текст:** белый, полужирный (`text-white font-semibold text-xs sm:text-sm`)

### 4.2 Второстепенные кнопки (Secondary Outline)
- **Фон:** прозрачный (`bg-transparent`)
- **Контур:** градиентная рамка толщиной 1px (`linear-gradient(135deg, #8C52D0 0%, #582F89 100%)`) с помощью `WebkitMask`
- **Иконка и текст:** фиолетовый градиентный текст (`bg-clip-text text-transparent`) и градиентная/фиолетовая иконка `w-3.5 h-3.5`
- **Форма:** `rounded-full`, `px-3.5 py-1.5`, текст `text-xs font-semibold`

---

## 5. Межстрочный интервал и информационные плашки
- **Межстрочный интервал (Line Height):** строго `leading-relaxed` или `leading-snug`, без растягивания линий.
- **Информационные плашки (Notice Box):** `p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed`
