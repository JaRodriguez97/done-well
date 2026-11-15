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
    key: 'trabajo',
    label: 'Violeta',
    cssVar: 'var(--color-trabajo)',
    hex: '#7567F8',
  },
  {
    key: 'personal',
    label: 'Turquesa',
    cssVar: 'var(--color-personal)',
    hex: '#40E0D0',
  },
  {
    key: 'estudios',
    label: 'Azul',
    cssVar: 'var(--color-estudios)',
    hex: '#6798FF',
  },
  {
    key: 'compras',
    label: 'Ámbar',
    cssVar: 'var(--color-compras)',
    hex: '#FFCC00',
  },
  {
    key: 'urgente',
    label: 'Coral',
    cssVar: 'var(--color-urgente)',
    hex: '#FF7660',
  },
  {
    key: 'otros',
    label: 'Pizarra',
    cssVar: 'var(--color-otros)',
    hex: '#667499',
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
    colorKey: 'trabajo',
    icon: 'briefcase-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-personal',
    name: 'Personal',
    colorKey: 'personal',
    icon: 'person-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-estudios',
    name: 'Estudios',
    colorKey: 'estudios',
    icon: 'school-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-compras',
    name: 'Compras',
    colorKey: 'compras',
    icon: 'cart-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-urgente',
    name: 'Urgente',
    colorKey: 'urgente',
    icon: 'flame-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];
