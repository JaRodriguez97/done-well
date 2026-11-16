import { TaskPriority, TaskStatus } from '../models/task.model';

export interface TaskPriorityOption {
  readonly key: TaskPriority;
  readonly label: string;
  readonly icon: string;
  readonly cssVar: string;
}

export interface TaskStatusOption {
  readonly key: TaskStatus;
  readonly label: string;
  readonly icon: string;
  readonly cssVar: string;
}

export const TASK_PRIORITY_OPTIONS: readonly TaskPriorityOption[] = [
  {
    key: 'low',
    label: 'Baja',
    icon: 'flag-outline',
    cssVar: 'var(--dw-color-turquesa)',
  },
  {
    key: 'medium',
    label: 'Media',
    icon: 'flag-outline',
    cssVar: 'var(--dw-color-azul)',
  },
  {
    key: 'high',
    label: 'Alta',
    icon: 'flame-outline',
    cssVar: 'var(--dw-color-coral)',
  },
];

export const TASK_STATUS_OPTIONS: readonly TaskStatusOption[] = [
  {
    key: 'pending',
    label: 'Pendiente',
    icon: 'time-outline',
    cssVar: 'var(--dw-color-pizarra)',
  },
  {
    key: 'in_progress',
    label: 'En progreso',
    icon: 'sync-outline',
    cssVar: 'var(--dw-color-ambar)',
  },
  {
    key: 'completed',
    label: 'Completada',
    icon: 'checkmark-circle-outline',
    cssVar: 'var(--dw-color-turquesa)',
  },
];
