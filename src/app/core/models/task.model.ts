import { BaseEntity, IdentifiableEntity } from './base-entity.model';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskPayload {
  title: string;
  categoryId: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  description?: string;
  subtasks?: Subtask[];
  startDate?: string | null;
  dueDate?: string | null;
}

export interface Task extends IdentifiableEntity, TaskPayload {
  completed: boolean;
}

export interface CreateTaskParams extends Partial<Task> {
  title: string;
}

export class TaskItem extends BaseEntity<Task> implements Task {
  private static readonly EMPTY_TITLE_ERROR =
    'El título de la tarea no puede estar vacío.';

  private _title: string;
  completed: boolean;
  categoryId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  subtasks: Subtask[];
  startDate: string | null;
  dueDate: string | null;

  constructor(params: CreateTaskParams) {
    super(params.id, params.createdAt);
    this._title = BaseEntity.validateRequiredText(
      params.title,
      TaskItem.EMPTY_TITLE_ERROR,
    );

    if (params.status === 'completed' || params.completed === true) {
      this.completed = true;
      this.status = 'completed';
    } else if (params.status === 'in_progress') {
      this.completed = false;
      this.status = 'in_progress';
    } else {
      this.completed = false;
      this.status = 'pending';
    }

    this.categoryId = params.categoryId ?? null;
    this.priority = params.priority ?? 'medium';
    this.description = (params.description ?? '').trim();
    this.subtasks = (params.subtasks ?? [])
      .map((item) => ({
        id: item.id || BaseEntity.generateId(),
        title: item.title.trim(),
        completed: Boolean(item.completed),
      }))
      .filter((item) => item.title.length > 0);
    this.startDate = params.startDate ?? null;
    this.dueDate = params.dueDate ?? null;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = BaseEntity.validateRequiredText(
      value,
      TaskItem.EMPTY_TITLE_ERROR,
    );
  }

  /**
   * Alterna el estado completado/pendiente de la tarea.
   */
  toggleCompleted(): boolean {
    this.completed = !this.completed;
    this.status = this.completed ? 'completed' : 'pending';
    return this.completed;
  }

  /**
   * Actualiza el estado explícito de la tarea manteniendo sincronizado el flag de completado.
   */
  setStatus(status: TaskStatus): void {
    this.status = status;
    this.completed = status === 'completed';
  }

  /**
   * Alterna el estado completado de una microtarea por su identificador.
   */
  toggleSubtask(subtaskId: string): void {
    this.subtasks = this.subtasks.map((item) =>
      item.id === subtaskId ? { ...item, completed: !item.completed } : item,
    );
  }

  /**
   * Asigna o desasigna una categoría a la tarea.
   */
  assignCategory(categoryId: string | null): void {
    this.categoryId = categoryId;
  }

  /**
   * Actualiza los datos editables de la tarea.
   */
  updateDetails(payload: Partial<TaskPayload>): void {
    if (payload.title !== undefined) {
      this.title = payload.title;
    }
    if (payload.categoryId !== undefined) {
      this.categoryId = payload.categoryId;
    }
    if (payload.priority !== undefined) {
      this.priority = payload.priority;
    }
    if (payload.status !== undefined) {
      this.setStatus(payload.status);
    }
    if (payload.description !== undefined) {
      this.description = payload.description.trim();
    }
    if (payload.subtasks !== undefined) {
      this.subtasks = payload.subtasks
        .map((item) => ({
          id: item.id || BaseEntity.generateId(),
          title: item.title.trim(),
          completed: Boolean(item.completed),
        }))
        .filter((item) => item.title.length > 0);
    }
    if (payload.startDate !== undefined) {
      this.startDate = payload.startDate;
    }
    if (payload.dueDate !== undefined) {
      this.dueDate = payload.dueDate;
    }
  }

  override toPlainObject(): Task {
    return {
      id: this.id,
      title: this._title,
      completed: this.completed,
      categoryId: this.categoryId,
      priority: this.priority,
      status: this.status,
      description: this.description,
      subtasks: this.subtasks.map((item) => ({ ...item })),
      startDate: this.startDate,
      dueDate: this.dueDate,
      createdAt: this.createdAt,
    };
  }
}
