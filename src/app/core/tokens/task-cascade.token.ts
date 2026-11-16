import { inject, InjectionToken } from '@angular/core';
import { TaskCascadeHandler } from '../models/task-cascade-handler.model';
import { TasksService } from '../../features/tasks/services/tasks.service';

/**
 * Token de inyección para el manejador de cascada de tareas.
 * Desacopla la lógica de categorías respecto a la implementación concreta de TasksService.
 */
export const TASK_CASCADE_HANDLER = new InjectionToken<TaskCascadeHandler>(
  'TASK_CASCADE_HANDLER',
  {
    providedIn: 'root',
    factory: () => inject(TasksService),
  },
);
