import { Project, WarehouseItem, Task, DocumentItem, ImageItem } from './types';

export const initialProjects: Project[] = [
  {
    id: 'p1',
    name: 'Свадьба · Ролл',
    clientName: 'Елизавета и Павел',
    clientEmail: 'liza.pavel@example.com',
    venue: 'Загородная усадьба «Ролл Резорт»',
    date: '2026-07-20',
    status: 'progress',
    currentStep: 0, // Бриф
    budget: 350000,
    estimate: [
      { id: 'e1_1', name: 'Свадебная арка «Классическая полукруглая»', category: 'Конструкции', quantity: 1, price: 45000 },
      { id: 'e1_2', name: 'Текстильная драпировка (шифон, пудра)', category: 'Текстиль', quantity: 1, price: 18000 },
      { id: 'e1_3', name: 'Флористическое оформление арки (розы, эвкалипт)', category: 'Флористика', quantity: 1, price: 85000 },
      { id: 'e1_4', name: 'Стулья Кьявари для выездной регистрации', category: 'Мебель', quantity: 60, price: 350 }
    ],
    brief: {
      style: 'Бохо-шик с классическими элементами',
      colors: ['#F6EEFF', '#E2D4F0', '#C08EF4', '#FFFFFF'],
      flowers: ['Пионовидные розы', 'Пыльная роза', 'Эвкалипт', 'Гипсофила'],
      guestsCount: 60,
      specialRequests: 'Обязательно нужна светодиодная гирлянда-роса на заднем фоне арки и много насыпных свечей вдоль дорожки.'
    }
  },
  {
    id: 'p2',
    name: 'День рождения · 30 лет',
    clientName: 'Анна Котова',
    clientEmail: 'anna.kotova@example.com',
    venue: 'Лофт «Верх», Краснодар',
    date: '2026-07-18',
    status: 'progress',
    currentStep: 1, // Визуал
    budget: 180000,
    estimate: [
      { id: 'e2_1', name: 'Металлическая круглая арка-кольцо', category: 'Конструкции', quantity: 1, price: 25000 },
      { id: 'e2_2', name: 'Неоновая вывеска «Happy 30»', category: 'Освещение', quantity: 1, price: 12000 },
      { id: 'e2_3', name: 'Гирлянды из сухоцветов и пампасной травы', category: 'Флористика', quantity: 2, price: 32000 },
      { id: 'e2_4', name: 'Композиции на гостевые столы в высоких вазах', category: 'Флористика', quantity: 5, price: 15000 }
    ],
    brief: {
      style: 'Современный минимализм, терракота и золото',
      colors: ['#D97706', '#F59E0B', '#F3F4F6', '#1F2937'],
      flowers: ['Пампасная трава', 'Засушенные пальмовые листья', 'Золотые антуриумы'],
      guestsCount: 35,
      specialRequests: 'Лофт имеет кирпичные стены, декор должен быть контрастным, с неоновым акцентом для фотозоны.'
    }
  },
  {
    id: 'p3',
    name: 'Корпоратив · Бренд X',
    clientName: 'ООО «Бренд X» (контакт: Дмитрий)',
    clientEmail: 'marketing@brandx.ru',
    venue: 'Отель «Марин Парк», Сочи',
    date: '2026-08-02',
    status: 'approved',
    currentStep: 3, // Согласовано
    budget: 148000,
    estimate: [
      { id: 'e3_1', name: 'Брендированная фотозона с 3D логотипом', category: 'Конструкции', quantity: 1, price: 65000 },
      { id: 'e3_2', name: 'Световые Led-колонны с RGB управлением', category: 'Освещение', quantity: 4, price: 12000 },
      { id: 'e3_3', name: 'Декоративная зелень на столы президиума', category: 'Флористика', quantity: 8, price: 4500 }
    ],
    brief: {
      style: 'Hi-Tech, строгая геометрия и глянец',
      colors: ['#3B82F6', '#1E3A8A', '#FFFFFF', '#9CA3AF'],
      flowers: ['Монстера', 'Белые каллы', 'Синие орхидеи (крашеные)'],
      guestsCount: 150,
      specialRequests: 'Фотозона должна содержать глянцевые поверхности и встроенную диодную подсветку по контуру.'
    }
  },
  {
    id: 'p4',
    name: 'Юбилей компании · 10 лет',
    clientName: 'Марина Кузнецова',
    clientEmail: 'marina.k@techcorp.com',
    venue: 'Бизнес-центр «Око», Москва',
    date: '2026-07-25',
    status: 'progress',
    currentStep: 2, // Смета
    budget: 450000,
    estimate: [
      { id: 'e4_1', name: 'Арочный портал высотой 3 метра', category: 'Конструкции', quantity: 1, price: 75000 },
      { id: 'e4_2', name: 'Зеркальное покрытие дорожки (серебро)', category: 'Текстиль', quantity: 1, price: 45000 },
      { id: 'e4_3', name: 'Каскадные люстры с хрустальными нитями', category: 'Освещение', quantity: 6, price: 15000 },
      { id: 'e4_4', name: 'Премиум композиции из живых белых цветов', category: 'Флористика', quantity: 12, price: 18000 }
    ],
    brief: {
      style: 'Mirror Glamour, много отражений и стекла',
      colors: ['#E5E7EB', '#F9FAFB', '#6B7280', '#000000'],
      flowers: ['Белые гортензии', 'Белые розы Экстаз', 'Дельфиниумы'],
      guestsCount: 80,
      specialRequests: 'Максимум блеска, зеркальные подиумы, подвесные конструкции с хрусталем над столами.'
    }
  },
  {
    id: 'p5',
    name: 'Открытие шоурума · ARTEL',
    clientName: 'ARTEL (контакт: Кристина)',
    clientEmail: 'showroom@artel.design',
    venue: 'ТЦ «Метрополис», Москва',
    date: '2026-07-14',
    status: 'waiting',
    currentStep: 3, // Согл
    budget: 280000,
    estimate: [
      { id: 'e5_1', name: 'Инсталляция «Живая стена» из мха и растений', category: 'Флористика', quantity: 1, price: 140000 },
      { id: 'e5_2', name: 'Дизайнерские вазы из матовой керамики', category: 'Декор', quantity: 15, price: 2000 },
      { id: 'e5_3', name: 'Минималистичные сухоцветы (лунария, ковыль)', category: 'Флористика', quantity: 15, price: 4000 },
      { id: 'e5_4', name: 'Точечные споты теплого спектра на стойках', category: 'Освещение', quantity: 8, price: 3000 }
    ],
    brief: {
      style: 'Wabi-Sabi, природная эстетика и эко-материалы',
      colors: ['#D1FAE5', '#A7F3D0', '#E5E7EB', '#78350F'],
      flowers: ['Стабилизированный мох', 'Эвкалипт', 'Ветки оливы', 'Сухоцветы Лунарии'],
      guestsCount: 120,
      specialRequests: 'Шоурум премиум мебели из натурального дерева, декор должен подчеркивать экологичность и естественность.'
    }
  },
  {
    id: 'p6',
    name: 'Новый год · Офис TechCo',
    clientName: 'ООО «ТехКо» (контакт: Юлия)',
    clientEmail: 'hr@techco.io',
    venue: 'Бизнес-парк «Комета», Москва',
    date: '2025-12-28',
    status: 'archive',
    currentStep: 3, // Согласовано
    budget: 210000,
    estimate: [
      { id: 'e6_1', name: 'Дизайнерская ель 4 метра с украшениями', category: 'Конструкции', quantity: 1, price: 95000 },
      { id: 'e6_2', name: 'Светодиодный занавес на окна 10х3м', category: 'Освещение', quantity: 1, price: 45000 },
      { id: 'e6_3', name: 'Хвойные гирлянды со свечами на перила', category: 'Флористика', quantity: 10, price: 7000 }
    ],
    brief: {
      style: 'Традиционное Рождество (зеленый, красный, золото)',
      colors: ['#EF4444', '#10B981', '#F59E0B', '#FFFFFF'],
      flowers: ['Хвойные ветви Нобилис', 'Падуб', 'Шишки сосновые'],
      guestsCount: 200,
      specialRequests: 'Оформить холл компании, создать уютную фотозону с искусственным камином, креслом и подарками.'
    }
  }
];

export const initialWarehouseItems: WarehouseItem[] = [
  { id: 'w1', name: 'Арка полукруглая «Классика» (металл)', category: 'Конструкции', total: 4, rented: 2, available: 2, pricePerDay: 5000, description: 'Разборный металлический каркас для выездной регистрации. Легко декорируется тканями и живыми цветами.' },
  { id: 'w2', name: 'Круглая арка-кольцо 2.2м (золото)', category: 'Конструкции', total: 3, rented: 1, available: 2, pricePerDay: 6000, description: 'Устойчивая конструкция из легкого сплава с качественным золотым напылением. Диаметр 2.2 метра.' },
  { id: 'w3', name: 'Гексагональная деревянная арка «Рустик»', category: 'Конструкции', total: 2, rented: 0, available: 2, pricePerDay: 7000, description: 'Стильная шестиугольная арка из натурального дерева хвойных пород. Идеальна для загородных и лесных свадеб.' },
  { id: 'w4', name: 'Ваза высокая стеклянная «Мартинка» 70см', category: 'Вазы и посуда', total: 40, rented: 15, available: 25, pricePerDay: 450, description: 'Классическая форма мартини для высоких цветочных композиций на столы гостей. Прозрачное прочное стекло.' },
  { id: 'w5', name: 'Керамическое кашпо матовое (пудра)', category: 'Вазы и посуда', total: 25, rented: 12, available: 13, pricePerDay: 300, description: 'Нежное керамическое кашпо с бархатистой матовой поверхностью в пудровом цвете для средних композиций.' },
  { id: 'w6', name: 'Подсвечник металлический на 5 свечей (золото)', category: 'Декор', total: 30, rented: 20, available: 10, pricePerDay: 600, description: 'Изящный канделябр под тонкие свечи. Создает торжественную и уютную атмосферу на ужине.' },
  { id: 'w7', name: 'Скатерть тканевая (лен, пыльно-розовая)', category: 'Текстиль', total: 50, rented: 35, available: 15, pricePerDay: 800, description: 'Износостойкая ткань с текстурой натурального льна. Плотная, ложится красивыми тяжелыми складками.' },
  { id: 'w8', name: 'Светодиодная гирлянда «Роса» 50м (теплая)', category: 'Освещение', total: 15, rented: 8, available: 7, pricePerDay: 1200, description: 'Гибкая ультратонкая медная проволока с микро-светодиодами теплого свечения. Безопасна во влажную погоду.' },
  { id: 'w9', name: 'Прожектор светодиодный RGB 50W', category: 'Освещение', total: 12, rented: 6, available: 6, pricePerDay: 1500, description: 'Мощный светодиодный прожектор с регулировкой цвета по пульту. Для точечной интерьерной подсветки зон.' },
  { id: 'w10', name: 'Неоновая надпись «Better Together»', category: 'Освещение', total: 2, rented: 1, available: 1, pricePerDay: 3500, description: 'Яркий гибкий неон на прозрачной акриловой подложке. Имеет крепления для подвеса на арку или фотостену.' }
];

export const initialTasks: Task[] = [
  { id: 't1', title: 'Заполнить бриф с молодожёнами', dueDate: 'Завтра', label: 'Бриф', projectRelation: 'Свадьба · Ролл', completed: false, color: 'warn' },
  { id: 't2', title: 'Подготовить мудборд арок', dueDate: '15 июля', label: 'Визуал', projectRelation: 'День рождения · 30 лет', completed: false, color: 'lavDeep' },
  { id: 't3', title: 'Утвердить смету с Кристиной', dueDate: '12 июля', label: 'Смета', projectRelation: 'Открытие шоурума · ARTEL', completed: false, color: 'sage' },
  { id: 't4', title: 'Подписать договор и акт', dueDate: '18 июля', label: 'Договор', projectRelation: 'Корпоратив · Бренд X', completed: true, color: 'sage' }
];

export const initialDocuments: DocumentItem[] = [
  { id: 'd1', name: 'Договор на оказание услуг декорирования №104', type: 'contract', date: '2026-07-02', status: 'signed', amount: 350000, projectRelation: 'Свадьба · Ролл' },
  { id: 'd2', name: 'Смета согласованная v3.pdf', type: 'estimate', date: '2026-07-05', status: 'signed', amount: 148000, projectRelation: 'Корпоратив · Бренд X' },
  { id: 'd3', name: 'Счет на предоплату 50% №88', type: 'invoice', date: '2026-07-06', status: 'paid', amount: 74000, projectRelation: 'Корпоратив · Бренд X' },
  { id: 'd4', name: 'Смета предварительная v1.xlsx', type: 'estimate', date: '2026-07-07', status: 'draft', amount: 450000, projectRelation: 'Юбилей компании · 10 лет' },
  { id: 'd5', name: 'Бриф заполненный клиентом.docx', type: 'contract', date: '2026-07-06', status: 'sent', amount: 0, projectRelation: 'Открытие шоурума · ARTEL' }
];

export const initialImages: ImageItem[] = [
  { id: 'img1', title: 'Круглая свадебная арка с пионами', category: 'arches', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', bgRemoved: false },
  { id: 'img2', title: 'Высокие золотые вазы с розами на столах', category: 'tables', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800', bgRemoved: false },
  { id: 'img3', title: 'Букет невесты из пионовидных роз и эвкалипта', category: 'bouquets', url: 'https://images.unsplash.com/photo-1546193430-c2d20e0cbda6?auto=format&fit=crop&q=80&w=800', bgRemoved: false },
  { id: 'img4', title: 'Арка в стиле рустик с сухоцветами', category: 'arches', url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800', bgRemoved: false },
  { id: 'img5', title: 'Минималистичные вазы Wabi-Sabi с хлопком', category: 'tables', url: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=800', bgRemoved: false },
  { id: 'img6', title: '3D Рендер неоновой фотозоны 30 лет', category: 'render', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', bgRemoved: false }
];
