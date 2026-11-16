import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys.constants';
import {
  Task,
  TaskItem,
  TaskPayload,
  TaskStatus,
} from '../../../core/models/task.model';
import { StorageService } from '../../../core/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  constructor(private readonly storageService: StorageService) {}

  /**
   * Carga las tareas almacenadas localmente y actualiza el flujo reactivo.
   */
  async loadTasks(): Promise<void> {
    const stored = await this.storageService.get<Task[]>(STORAGE_KEYS.TASKS);
    const validTasks = (stored ?? []).map((item) =>
      new TaskItem(item).toPlainObject(),
    );
    this.tasksSubject.next(validTasks);
  }

  /**
   * Crea una nueva tarea, la ubica al inicio de la lista y guarda el estado.
   */
  async addTask(
    title: string,
    categoryId: string | null = null,
    details: Partial<Omit<TaskPayload, 'title' | 'categoryId'>> = {},
  ): Promise<Task> {
    const newTask = new TaskItem({
      title,
      categoryId,
      ...details,
    }).toPlainObject();
    const updatedTasks = [newTask, ...this.tasksSubject.value];
    await this.persistTasks(updatedTasks);
    return newTask;
  }

  /**
   * Actualiza los datos de una tarea existente y guarda el estado.
   */
  async updateTask(
    taskId: string,
    payload: Partial<TaskPayload>,
  ): Promise<void> {
    await this.updateTaskById(taskId, (entity) => entity.updateDetails(payload));
  }

  /**
   * Alterna el estado completado/pendiente de una tarea por su identificador.
   */
  async toggleTask(taskId: string): Promise<void> {
    await this.updateTaskById(taskId, (entity) => entity.toggleCompleted());
  }

  /**
   * Actualiza el estado explícito de una tarea y sincroniza su persistencia local.
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    await this.updateTaskById(taskId, (entity) => entity.setStatus(status));
  }

  /**
   * Alterna el estado completado de una microtarea perteneciente a una tarea.
   */
  async toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
    await this.updateTaskById(taskId, (entity) =>
      entity.toggleSubtask(subtaskId),
    );
  }

  private async updateTaskById(
    taskId: string,
    mutate: (entity: TaskItem) => void,
  ): Promise<void> {
    const updatedTasks = this.tasksSubject.value.map((task) => {
      if (task.id !== taskId) {
        return task;
      }
      const entity = new TaskItem(task);
      mutate(entity);
      return entity.toPlainObject();
    });
    await this.persistTasks(updatedTasks);
  }

  /**
   * Elimina una tarea por su identificador y actualiza el almacenamiento local.
   */
  async deleteTask(taskId: string): Promise<void> {
    const updatedTasks = this.tasksSubject.value.filter(
      (task) => task.id !== taskId,
    );
    await this.persistTasks(updatedTasks);
  }

  /**
   * Desasigna la categoría indicada en las tareas afectadas conservando sus datos.
   */
  async clearCategoryFromTasks(categoryId: string): Promise<void> {
    let hasChanges = false;
    const updatedTasks = this.tasksSubject.value.map((task) => {
      if (task.categoryId !== categoryId) {
        return task;
      }
      hasChanges = true;
      const entity = new TaskItem(task);
      entity.assignCategory(null);
      return entity.toPlainObject();
    });

    if (hasChanges) {
      await this.persistTasks(updatedTasks);
    }
  }

  /**
   * Elimina todas las tareas vinculadas a una categoría específica.
   */
  async deleteTasksByCategory(categoryId: string): Promise<void> {
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = currentTasks.filter(
      (task) => task.categoryId !== categoryId,
    );

    if (updatedTasks.length !== currentTasks.length) {
      await this.persistTasks(updatedTasks);
    }
  }

  private async persistTasks(tasks: Task[]): Promise<void> {
    await this.storageService.set(STORAGE_KEYS.TASKS, tasks);
    this.tasksSubject.next(tasks);
  }
}
