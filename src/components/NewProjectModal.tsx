import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, DollarSign, MapPin, User, Mail } from 'lucide-react';
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
  const [clientEmail, setClientEmail] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState(150000);
  const [status, setStatus] = useState<ProjectStatus>('progress');
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name,
      clientName: clientName || 'Не указан',
      clientEmail: clientEmail || 'client@example.com',
      venue: venue || 'Площадка не указана',
      date: date || new Date().toISOString().split('T')[0],
      status,
      currentStep,
      budget: Number(budget) || 0
    });

    // Reset Form
    setName('');
    setClientName('');
    setClientEmail('');
    setVenue('');
    setDate('');
    setBudget(150000);
    setStatus('progress');
    setCurrentStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-lg bg-white/65 dark:bg-zinc-900/65 backdrop-blur-2xl border border-white/80 dark:border-zinc-700/80 rounded-3xl shadow-2xl shadow-purple-950/10 overflow-hidden z-10"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Новый проект</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Project Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Название проекта *</label>
            <input
              type="text"
              required
              placeholder="например, Свадьба в лесу или День Рождения"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-white/70 dark:bg-zinc-800/80 border border-stone-300/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#8C52D0] text-sm"
            />
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Имя клиента</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Анна К."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/70 dark:bg-zinc-800/80 border border-stone-300/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#8C52D0] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email клиента</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  placeholder="anna@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/70 dark:bg-zinc-800/80 border border-stone-300/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#8C52D0] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Venue & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Площадка проведения</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Лофт «Верх», Краснодар"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/70 dark:bg-zinc-800/80 border border-stone-300/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#8C52D0] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Дата мероприятия</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/70 dark:bg-zinc-800/80 border border-stone-300/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Budget & Initial Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Бюджет (₽)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/70 dark:bg-zinc-800/80 border border-stone-300/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Начальный Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-4 py-2.5 rounded-full bg-white/70 dark:bg-zinc-800/80 border border-stone-300/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm cursor-pointer"
              >
                <option value="progress">В работе</option>
                <option value="waiting">Ждёт клиента</option>
                <option value="approved">Согласован</option>
                <option value="archive">В архиве</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-stone-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100/60 dark:hover:bg-zinc-800/55 transition-colors text-sm cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full text-white font-medium transition-all duration-300 hover:opacity-95 hover:shadow-lg active:scale-[0.99] text-sm cursor-pointer"
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
