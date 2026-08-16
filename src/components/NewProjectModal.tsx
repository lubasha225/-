import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, MapPin, User, Mail, Phone, Sparkles } from 'lucide-react';
import { Project, ProjectStatus } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'estimate' | 'brief'>) => void;
}

export default function NewProjectModal({ isOpen, onClose, onSubmit }: NewProjectModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('progress');
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      clientName: clientName.trim() || 'Не указан',
      clientPhone: clientPhone.trim() || '',
      clientEmail: clientEmail.trim() || '',
      venue: venue.trim() || 'Площадка не указана',
      date: date || new Date().toISOString().split('T')[0],
      status,
      currentStep,
      budget: 0
    });

    // Reset Form
    setName('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setVenue('');
    setDate('');
    setStatus('progress');
    setCurrentStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.35 }}
        className="relative w-full max-w-md sm:max-w-lg bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/70 dark:border-zinc-800/70 rounded-[24px] sm:rounded-[28px] shadow-2xl shadow-purple-950/20 overflow-hidden z-10 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--lavenderSoft)] rounded-lg shrink-0">
              <Sparkles className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                Новый проект
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-normal leading-tight">
                Создание карточки декора и концепции
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
          {/* Project Name (Full Width) */}
          <div className="space-y-0.5">
            <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block pl-1">
              Название проекта *
            </label>
            <input
              type="text"
              required
              placeholder="например, Свадьба в лесу или День Рождения"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 sm:h-10 px-3 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#8C52D0] focus:ring-2 focus:ring-[#8C52D0]/15 text-xs sm:text-sm font-normal transition-all"
            />
          </div>

          {/* Client Name & Phone (Always 2 Columns) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-0.5">
              <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block pl-1 truncate">
                Имя клиента
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Анна К."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full h-9 sm:h-10 pl-8 pr-2.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#8C52D0] focus:ring-2 focus:ring-[#8C52D0]/15 text-xs sm:text-sm font-normal transition-all"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block pl-1 truncate">
                Телефон клиента
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 shrink-0 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+7 999 123-45-67"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full h-9 sm:h-10 pl-8 pr-2.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#8C52D0] focus:ring-2 focus:ring-[#8C52D0]/15 text-xs sm:text-sm font-normal transition-all"
                />
              </div>
            </div>
          </div>

          {/* Client Email & Venue (Always 2 Columns) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-0.5">
              <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block pl-1 truncate">
                Email клиента
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 shrink-0 pointer-events-none" />
                <input
                  type="email"
                  placeholder="anna@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full h-9 sm:h-10 pl-8 pr-2.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#8C52D0] focus:ring-2 focus:ring-[#8C52D0]/15 text-xs sm:text-sm font-normal transition-all"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block pl-1 truncate">
                Площадка
              </label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Лофт «Верх»"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full h-9 sm:h-10 pl-8 pr-2.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#8C52D0] focus:ring-2 focus:ring-[#8C52D0]/15 text-xs sm:text-sm font-normal transition-all"
                />
              </div>
            </div>
          </div>

          {/* Date & Status (Always 2 Columns) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-0.5">
              <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block pl-1 truncate">
                Дата события
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 shrink-0 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-9 sm:h-10 pl-8 pr-2 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] focus:ring-2 focus:ring-[#8C52D0]/15 text-xs sm:text-sm font-normal transition-all"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block pl-1 truncate">
                Статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full h-9 sm:h-10 px-2.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] focus:ring-2 focus:ring-[#8C52D0]/15 text-xs sm:text-sm font-normal transition-all cursor-pointer"
              >
                <option value="progress">В работе</option>
                <option value="waiting">Ждёт клиента</option>
                <option value="approved">Согласован</option>
                <option value="archive">В архиве</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2 sm:pt-3 border-t border-zinc-200/40 dark:border-zinc-800/40">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 sm:h-10 rounded-full border border-zinc-300/90 dark:border-zinc-700 bg-transparent hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-2xs hover:shadow-xs"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 h-9 sm:h-10 rounded-full text-white font-semibold text-xs sm:text-sm transition-all duration-200 hover:opacity-95 hover:shadow-md hover:shadow-purple-900/20 active:scale-[0.98] cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
            >
              Создать проект
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

