import { BaseEntity, IdentifiableEntity } from './base-entity.model';

export interface TaskPayload {
  title: string;
  categoryId: string | null;
}

export interface Task extends IdentifiableEntity, TaskPayload {
  completed: boolean;
}

export interface CreateTaskParams extends Partial<Task> {
  title: string;
}

export class TaskItem extends BaseEntity<Task> implements Task {
  private static readonly EMPTY_TITLE_ERROR = 'El título de la tarea no puede estar vacío.';

  private _title: string;
  completed: boolean;
  categoryId: string | null;

  constructor(params: CreateTaskParams) {
    super(params.id, params.createdAt);
    this._title = BaseEntity.validateRequiredText(params.title, TaskItem.EMPTY_TITLE_ERROR);
    this.completed = params.completed ?? false;
    this.categoryId = params.categoryId ?? null;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = BaseEntity.validateRequiredText(value, TaskItem.EMPTY_TITLE_ERROR);
  }

  /**
   * Alterna el estado completado/pendiente de la tarea.
   */
  toggleCompleted(): boolean {
    this.completed = !this.completed;
    return this.completed;
  }

  /**
   * Asigna o desasigna una categoría a la tarea.
   */
  assignCategory(categoryId: string | null): void {
    this.categoryId = categoryId;
  }

  override toPlainObject(): Task {
    return {
      id: this.id,
      title: this._title,
      completed: this.completed,
      categoryId: this.categoryId,
      createdAt: this.createdAt,
    };
  }
}
