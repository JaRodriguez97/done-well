import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys.constants';
import { Task, TaskItem } from '../../../core/models/task.model';
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
    const validTasks = (stored ?? []).map((item) => new TaskItem(item).toPlainObject());
    this.tasksSubject.next(validTasks);
  }

  /**
   * Crea una nueva tarea, la ubica al inicio de la lista y guarda el estado.
   */
  async addTask(title: string, categoryId: string | null = null): Promise<Task> {
    const newTask = new TaskItem({ title, categoryId }).toPlainObject();
    const updatedTasks = [newTask, ...this.tasksSubject.value];
    await this.persistTasks(updatedTasks);
    return newTask;
  }

  /**
   * Alterna el estado completado/pendiente de una tarea por su identificador.
   */
  async toggleTask(taskId: string): Promise<void> {
    const updatedTasks = this.tasksSubject.value.map((task) => {
      if (task.id !== taskId) {
        return task;
      }
      const entity = new TaskItem(task);
      entity.toggleCompleted();
      return entity.toPlainObject();
    });
    await this.persistTasks(updatedTasks);
  }

  /**
   * Elimina una tarea por su identificador y actualiza el almacenamiento local.
   */
  async deleteTask(taskId: string): Promise<void> {
    const updatedTasks = this.tasksSubject.value.filter((task) => task.id !== taskId);
    await this.persistTasks(updatedTasks);
  }

  private async persistTasks(tasks: Task[]): Promise<void> {
    await this.storageService.set(STORAGE_KEYS.TASKS, tasks);
    this.tasksSubject.next(tasks);
  }
}
