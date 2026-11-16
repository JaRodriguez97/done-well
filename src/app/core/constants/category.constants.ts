import {
  airplaneOutline,
  bookOutline,
  briefcaseOutline,
  cafeOutline,
  calendarOutline,
  carOutline,
  cartOutline,
  cashOutline,
  codeSlashOutline,
  constructOutline,
  fitnessOutline,
  flameOutline,
  gameControllerOutline,
  giftOutline,
  homeOutline,
  laptopOutline,
  medkitOutline,
  musicalNotesOutline,
  pawOutline,
  personOutline,
  pricetagOutline,
  restaurantOutline,
  schoolOutline,
  walletOutline,
} from 'ionicons/icons';
import { Category, CategoryColorKey } from '../models/category.model';

export const DEFAULT_CATEGORY_ICON = 'pricetag-outline';

export interface CategoryColorOption {
  readonly key: CategoryColorKey;
  readonly label: string;
  readonly cssVar: string;
  readonly hex: string;
}

export interface CategoryIconOption {
  readonly name: string;
  readonly label: string;
  readonly featured?: boolean;
}

export const CATEGORY_COLOR_OPTIONS: readonly CategoryColorOption[] = [
  {
    key: 'violeta',
    label: 'Violeta',
    cssVar: 'var(--dw-color-violeta)',
    hex: '#7567F8',
  },
  {
    key: 'turquesa',
    label: 'Turquesa',
    cssVar: 'var(--dw-color-turquesa)',
    hex: '#40E0D0',
  },
  {
    key: 'azul',
    label: 'Azul',
    cssVar: 'var(--dw-color-azul)',
    hex: '#6798FF',
  },
  {
    key: 'ambar',
    label: 'Ámbar',
    cssVar: 'var(--dw-color-ambar)',
    hex: '#FFCC00',
  },
  {
    key: 'coral',
    label: 'Coral',
    cssVar: 'var(--dw-color-coral)',
    hex: '#FF7660',
  },
  {
    key: 'pizarra',
    label: 'Pizarra',
    cssVar: 'var(--dw-color-pizarra)',
    hex: '#667499',
  },
  {
    key: 'esmeralda',
    label: 'Esmeralda',
    cssVar: 'var(--dw-color-esmeralda)',
    hex: '#10B981',
  },
  {
    key: 'rosa',
    label: 'Rosa',
    cssVar: 'var(--dw-color-rosa)',
    hex: '#F43F5E',
  },
  {
    key: 'indigo',
    label: 'Índigo',
    cssVar: 'var(--dw-color-indigo)',
    hex: '#6366F1',
  },
  {
    key: 'celeste',
    label: 'Celeste',
    cssVar: 'var(--dw-color-celeste)',
    hex: '#0EA5E9',
  },
  {
    key: 'fucsia',
    label: 'Fucsia',
    cssVar: 'var(--dw-color-fucsia)',
    hex: '#D946EF',
  },
  {
    key: 'lavanda',
    label: 'Lavanda',
    cssVar: 'var(--dw-color-lavanda)',
    hex: '#A99EFF',
  },
];

export const CATEGORY_ICON_OPTIONS: readonly CategoryIconOption[] = [
  { name: 'pricetag-outline', label: 'Etiqueta', featured: true },
  { name: 'briefcase-outline', label: 'Trabajo', featured: true },
  { name: 'person-outline', label: 'Personal', featured: true },
  { name: 'school-outline', label: 'Estudios', featured: true },
  { name: 'cart-outline', label: 'Compras', featured: true },
  { name: 'flame-outline', label: 'Urgente', featured: true },
  { name: 'home-outline', label: 'Hogar' },
  { name: 'fitness-outline', label: 'Ejercicio' },
  { name: 'medkit-outline', label: 'Salud' },
  { name: 'wallet-outline', label: 'Finanzas' },
  { name: 'cash-outline', label: 'Pagos' },
  { name: 'airplane-outline', label: 'Viajes' },
  { name: 'car-outline', label: 'Vehículo' },
  { name: 'restaurant-outline', label: 'Comida' },
  { name: 'cafe-outline', label: 'Café' },
  { name: 'book-outline', label: 'Lectura' },
  { name: 'laptop-outline', label: 'Equipo' },
  { name: 'code-slash-outline', label: 'Código' },
  { name: 'musical-notes-outline', label: 'Música' },
  { name: 'game-controller-outline', label: 'Ocio' },
  { name: 'paw-outline', label: 'Mascotas' },
  { name: 'gift-outline', label: 'Regalos' },
  { name: 'calendar-outline', label: 'Eventos' },
  { name: 'construct-outline', label: 'Soporte' },
];

export const CATEGORY_ICON_REGISTRY = {
  briefcaseOutline,
  personOutline,
  schoolOutline,
  cartOutline,
  flameOutline,
  pricetagOutline,
  homeOutline,
  fitnessOutline,
  medkitOutline,
  walletOutline,
  cashOutline,
  airplaneOutline,
  carOutline,
  restaurantOutline,
  cafeOutline,
  bookOutline,
  laptopOutline,
  codeSlashOutline,
  musicalNotesOutline,
  gameControllerOutline,
  pawOutline,
  giftOutline,
  calendarOutline,
  constructOutline,
};

/**
 * Categorías iniciales cargadas cuando aún no existen datos guardados.
 */
export const DEFAULT_CATEGORIES: readonly Category[] = [
  {
    id: 'cat-trabajo',
    name: 'Trabajo',
    colorKey: 'violeta',
    icon: 'briefcase-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-personal',
    name: 'Personal',
    colorKey: 'turquesa',
    icon: 'person-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-estudios',
    name: 'Estudios',
    colorKey: 'azul',
    icon: 'school-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-compras',
    name: 'Compras',
    colorKey: 'ambar',
    icon: 'cart-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-urgente',
    name: 'Urgente',
    colorKey: 'coral',
    icon: 'flame-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];
