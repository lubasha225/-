import React, { useState } from 'react';
import { UploadCloud, Trash2 } from 'lucide-react';
import { ImageItem } from '../types';

interface ImagesTabProps {
  images: ImageItem[];
  onUpdateImages: (updated: ImageItem[]) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

export default function ImagesTab({ images, onUpdateImages, showToast }: ImagesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'arches' | 'tables' | 'bouquets' | 'render'>('all');

  const categories: { key: any; label: string }[] = [
    { key: 'all', label: 'Все фото' },
    { key: 'arches', label: 'Арки и фотозоны' },
    { key: 'tables', label: 'Гостевые столы' },
    { key: 'bouquets', label: 'Флористика' },
    { key: 'render', label: '3D Эскизы' }
  ];

  const getCategoryCount = (catKey: string) => {
    if (catKey === 'all') return images.length;
    return images.filter(img => img.category === catKey).length;
  };

  const handleCategoryChange = (imgId: string, newCategory: 'arches' | 'tables' | 'bouquets' | 'render') => {
    const updated = images.map(img => img.id === imgId ? { ...img, category: newCategory } : img);
    onUpdateImages(updated);
    showToast('Категория изменена', 'Категория изображения успешно обновлена.', 'success');
  };

  const handleDeleteImage = (imgId: string) => {
    const updated = images.filter(img => img.id !== imgId);
    onUpdateImages(updated);
    showToast('Изображение удалено', 'Изображение успешно удалено из галереи.', 'info');
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const newImage: ImageItem = {
        id: 'img_' + Date.now(),
        title: file.name.split('.')[0] || 'Новое фото',
        url: url,
        category: selectedCategory === 'all' ? 'arches' : selectedCategory,
        bgRemoved: false
      };
      onUpdateImages([newImage, ...images]);
      showToast('Фото загружено', 'Новое изображение добавлено в вашу галерею.', 'success');
    }
  };

  const filteredImages = images.filter(img => selectedCategory === 'all' || img.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Categories and Upload button */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/10 dark:bg-zinc-900/5 p-3 rounded-2xl border border-[var(--glass-edge)]/40">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.key);
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                    : 'bg-white/30 dark:bg-zinc-800/30 border-zinc-200/50 dark:border-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 transition-all ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center shrink-0">
          <label className="cursor-pointer border border-zinc-200 dark:border-zinc-800 hover:border-[var(--lavenderAccent)] hover:bg-[var(--lavenderAccent)]/5 rounded-xl px-4 py-1.5 text-xs text-[var(--ink)] bg-white/30 dark:bg-zinc-900/20 transition-all flex items-center gap-2 font-semibold">
            <UploadCloud className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0" />
            <span>Загрузить фото</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadPhoto}
            />
          </label>
        </div>
      </div>

      {/* Grid containing cards */}
      {filteredImages.length === 0 ? (
        <div className="py-16 text-center text-[var(--faint)] text-xs tracking-wide">
          В выбранной категории нет изображений.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full animate-fadeIn">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="glass-panel rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 relative flex flex-col justify-between group"
            >
              {/* Photo Box (1:1 aspect square) */}
              <div className="aspect-square w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                {img.bgRemoved ? (
                  <div className="absolute inset-0 bg-[radial-gradient(#ddd_1px,transparent_1px)] dark:bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px] bg-white dark:bg-zinc-950 z-0" />
                ) : null}

                <img
                  src={img.url}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover relative z-5 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Editable Category & Delete button */}
              <div className="p-3.5 relative z-10 bg-white/40 dark:bg-zinc-900/20 flex items-center justify-between gap-2 border-t border-zinc-100/50 dark:border-zinc-800/40">
                <div className="flex-1 min-w-0">
                  <select
                    value={img.category}
                    onChange={(e) => handleCategoryChange(img.id, e.target.value as any)}
                    className="text-[11px] bg-white/80 dark:bg-zinc-900/60 text-[var(--ink)] border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl px-2 py-1.5 focus:outline-none focus:border-[var(--lavenderAccent)] font-medium cursor-pointer w-full transition-all"
                  >
                    <option value="arches">Арки и фотозоны</option>
                    <option value="tables">Гостевые столы</option>
                    <option value="bouquets">Флористика</option>
                    <option value="render">3D Эскизы</option>
                  </select>
                </div>

                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="p-2 text-rose-400 dark:text-rose-500/80 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 hover:border-rose-100 dark:hover:border-rose-900/30 transition-all cursor-pointer shrink-0"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
