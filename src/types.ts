export type ProjectStatus = 'progress' | 'waiting' | 'approved' | 'archive';

export interface EstimateItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

export interface BriefData {
  style: string;
  colors: string[];
  flowers: string[];
  guestsCount: number;
  specialRequests: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  venue: string;
  date: string;
  status: ProjectStatus;
  currentStep: number; // 0: Бриф, 1: Визуал, 2: Смета, 3: Согл, 4: Финал
  budget: number;
  estimate: EstimateItem[];
  brief: BriefData;
  imageUrl?: string;
}

export interface WarehouseItem {
  id: string;
  name: string;
  category: string;
  total: number;
  rented: number;
  available: number;
  pricePerDay: number;
  imageUrl?: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  label: string;
  projectRelation: string;
  completed: boolean;
  color: 'warn' | 'lavDeep' | 'sage';
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'contract' | 'estimate' | 'invoice' | 'act';
  date: string;
  status: 'draft' | 'sent' | 'signed' | 'paid';
  amount: number;
  projectRelation: string;
}

export interface ImageItem {
  id: string;
  title: string;
  category: string;
  url: string;
  bgRemoved?: boolean;
}
