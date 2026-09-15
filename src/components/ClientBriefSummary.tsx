import React from 'react';
import {
  User,
  Phone,
  Calendar,
  Users,
  MapPin,
  Palette,
  Wallet,
  Sparkles,
  ExternalLink,
  Edit3,
  Check
} from 'lucide-react';

interface ClientBriefSummaryProps {
  formData: Record<string, string>;
  customColors: string[];
  referenceImages: string[];
  onSwitchToEdit: () => void;
}

export const ClientBriefSummary: React.FC<ClientBriefSummaryProps> = ({
  formData,
  customColors,
  referenceImages,
  onSwitchToEdit,
}) => {
  const fields = [
    { label: '1. ИМЯ КЛИЕНТА', val: formData['ИМЯ КЛИЕНТА'] },
    { label: '2. ТЕЛЕФОН', val: formData['ТЕЛЕФОН'] },
    { label: '3. СОБЫТИЕ', val: formData['СОБЫТИЕ'] },
    { label: '4. ДАТА', val: formData['ДАТА'] },
    { label: '5. ГОСТЕЙ', val: formData['ГОСТЕЙ'] ? `${formData['ГОСТЕЙ']} чел.` : '' },
    { label: '6. ФОРМАТ СОБЫТИЯ', val: formData['ФОРМАТ СОБЫТИЯ'] },
    { label: '7. АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ', val: formData['АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ'] },
    { label: '8. КОНТАКТ ПЛОЩАДКИ', val: formData['КОНТАКТ ПЛОЩАДКИ'] },
    { label: '9. ПРАЗДНИК НА УЛИЦЕ', val: formData['ПРАЗДНИК НА УЛИЦЕ'] },
    { label: '10. КТО ПРИНИМАЕТ РАБОТЫ', val: formData['КТО ПРИНИМАЕТ РАБОТЫ'] },
    { label: '12. СТИЛЬ ОФОРМЛЕНИЯ', val: formData['СТИЛЬ ОФОРМЛЕНИЯ'] },
    { label: '13. ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ', val: formData['ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ'] },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Сводка заполненного брифа (14 вопросов)
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Все ключевые параметры события для флориста и декоратора
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToEdit}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-[var(--primary-accent)]/30 text-[var(--primary-accent)] hover:bg-[var(--lavenderSoft)] cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Редактировать</span>
        </button>
      </div>

      {/* SUMMARY GRID: 12 standard items + PALETTE + ADDITIONAL INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
        {fields.map((f, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs"
          >
            <span className="text-[10px] font-normal uppercase tracking-normal text-zinc-500 dark:text-zinc-400 block mb-1">
              {f.label}
            </span>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 break-words">
              {f.val || <span className="text-zinc-400 font-normal italic">Не заполнено</span>}
            </p>
          </div>
        ))}

        {/* 11. ПАЛИТРА ОФОРМЛЕНИЯ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs">
          <span className="text-[10px] font-normal uppercase tracking-normal text-zinc-500 dark:text-zinc-400 block mb-1">
            11. ПАЛИТРА ОФОРМЛЕНИЯ
          </span>
          {customColors.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {customColors.map((hex, idx) => (
                <span
                  key={idx}
                  className="w-5 h-5 rounded-full border border-black/15 dark:border-white/20 shadow-2xs inline-block"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          ) : (
            <span className="text-xs text-zinc-400 font-normal italic">Не выбрана</span>
          )}
        </div>

        {/* 14. ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ */}
        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs">
          <span className="text-[10px] font-normal uppercase tracking-normal text-zinc-500 dark:text-zinc-400 block mb-1">
            14. ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
          </span>
          <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {formData['ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ'] || (
              <span className="text-zinc-400 font-normal italic">Нет особых примечаний</span>
            )}
          </p>
        </div>
      </div>

      {/* REFERENCE IMAGES SUMMARY */}
      {referenceImages.length > 0 && (
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[24px] sm:rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Прикрепленные фотографии и референсы ({referenceImages.length})
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {referenceImages.map((img, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-2xs"
              >
                <img
                  src={img}
                  alt={`Референс ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
