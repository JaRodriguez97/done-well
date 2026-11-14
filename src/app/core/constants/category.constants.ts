import { Category, CategoryColorKey } from '../models/category.model';

export interface CategoryColorOption {
  readonly key: CategoryColorKey;
  readonly label: string;
  readonly cssVar: string;
  readonly hex: string;
  readonly defaultIcon: string;
}

export const CATEGORY_COLOR_OPTIONS: readonly CategoryColorOption[] = [
  {
    key: 'trabajo',
    label: 'Trabajo',
    cssVar: 'var(--color-trabajo)',
    hex: '#7567F8',
    defaultIcon: 'briefcase-outline',
  },
  {
    key: 'personal',
    label: 'Personal',
    cssVar: 'var(--color-personal)',
    hex: '#40E0D0',
    defaultIcon: 'person-outline',
  },
  {
    key: 'estudios',
    label: 'Estudios',
    cssVar: 'var(--color-estudios)',
    hex: '#6798FF',
    defaultIcon: 'school-outline',
  },
  {
    key: 'compras',
    label: 'Compras',
    cssVar: 'var(--color-compras)',
    hex: '#FFCC00',
    defaultIcon: 'cart-outline',
  },
  {
    key: 'urgente',
    label: 'Urgente',
    cssVar: 'var(--color-urgente)',
    hex: '#FF7660',
    defaultIcon: 'flame-outline',
  },
  {
    key: 'otros',
    label: 'Otros',
    cssVar: 'var(--color-otros)',
    hex: '#667499',
    defaultIcon: 'pricetag-outline',
  },
];

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
