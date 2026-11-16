import { Category } from '../models/category.model';
import { Task } from '../models/task.model';

export function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'cat-trabajo',
    name: 'Trabajo',
    colorKey: 'violeta',
    icon: 'briefcase-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-mock-1',
    title: 'Tarea de prueba',
    completed: false,
    categoryId: 'cat-trabajo',
    priority: 'medium',
    status: 'pending',
    description: '',
    subtasks: [],
    startDate: null,
    dueDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export const MOCK_CATEGORIES: readonly Category[] = [
  createMockCategory({ id: 'cat-trabajo', name: 'Trabajo', colorKey: 'violeta', icon: 'briefcase-outline' }),
  createMockCategory({ id: 'cat-personal', name: 'Personal', colorKey: 'turquesa', icon: 'person-outline' }),
  createMockCategory({ id: 'cat-estudios', name: 'Estudios', colorKey: 'azul', icon: 'school-outline' }),
];

export const MOCK_TASKS: readonly Task[] = [
  createMockTask({ id: 'task-1', title: 'Completar documentación', completed: false, categoryId: 'cat-trabajo' }),
  createMockTask({ id: 'task-2', title: 'Hacer compras semanales', completed: true, categoryId: 'cat-personal' }),
];
