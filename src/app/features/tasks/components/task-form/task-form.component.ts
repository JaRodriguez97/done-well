import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
  IonTextarea,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  calendarOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  flagOutline,
  flameOutline,
  listOutline,
  syncOutline,
  timeOutline,
} from 'ionicons/icons';
import { CATEGORY_ICON_REGISTRY } from '../../../../core/constants/category.constants';
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '../../../../core/constants/task.constants';
import { Category } from '../../../../core/models/category.model';
import {
  Subtask,
  Task,
  TaskPayload,
  TaskPriority,
  TaskStatus,
} from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonTextarea,
    IonList,
    IonChip,
    IonLabel,
    IonButton,
    IonIcon,
    IonText,
  ],
})
export class TaskFormComponent {
  private _disabled = false;
  private _initialTask: Task | null = null;

  @Input() categories: Category[] = [];

  @Input()
  get initialTask(): Task | null {
    if (!this._initialTask) {
      return null;
    }
    return {
      ...this._initialTask,
      subtasks: this._initialTask.subtasks?.map((sub) => ({ ...sub })),
    };
  }

  set initialTask(task: Task | null) {
    if (!task) {
      this._initialTask = null;
      this.resetForm();
      return;
    }

    this._initialTask = {
      ...task,
      subtasks: task.subtasks?.map((sub) => ({ ...sub })),
    };

    this.titleControl.setValue(task.title);
    this.descriptionControl.setValue(task.description ?? '');
    this.categoryControl.setValue(task.categoryId);
    this.priorityControl.setValue(task.priority ?? 'medium');
    this.statusControl.setValue(
      task.status ?? (task.completed ? 'completed' : 'pending'),
    );
    this.startDateControl.setValue(task.startDate ?? '');
    this.dueDateControl.setValue(task.dueDate ?? '');
    this.subtasks = (task.subtasks ?? []).map((item) => ({ ...item }));
  }

  get isEditMode(): boolean {
    return this._initialTask !== null;
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
    for (const control of this.controls) {
      if (value) {
        control.disable({ emitEvent: false });
      } else {
        control.enable({ emitEvent: false });
      }
    }
  }

  @Output() readonly taskSubmitted = new EventEmitter<TaskPayload>();

  readonly priorityOptions = TASK_PRIORITY_OPTIONS;
  readonly statusOptions = TASK_STATUS_OPTIONS;

  readonly titleControl = new FormControl('', { nonNullable: true });
  readonly descriptionControl = new FormControl('', { nonNullable: true });
  readonly categoryControl = new FormControl<string | null>(null);
  readonly priorityControl = new FormControl<TaskPriority>('medium', {
    nonNullable: true,
  });
  readonly statusControl = new FormControl<TaskStatus>('pending', {
    nonNullable: true,
  });
  readonly startDateControl = new FormControl('', { nonNullable: true });
  readonly dueDateControl = new FormControl('', { nonNullable: true });
  readonly subtaskInputControl = new FormControl('', { nonNullable: true });

  subtasks: Subtask[] = [];
  validationError: string | null = null;

  private readonly controls = [
    this.titleControl,
    this.descriptionControl,
    this.categoryControl,
    this.priorityControl,
    this.statusControl,
    this.startDateControl,
    this.dueDateControl,
    this.subtaskInputControl,
  ];

  constructor() {
    addIcons({
      ...CATEGORY_ICON_REGISTRY,
      addCircleOutline,
      alertCircleOutline,
      flagOutline,
      flameOutline,
      timeOutline,
      syncOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      calendarOutline,
      listOutline,
    });
  }

  /**
   * Asigna la categoría seleccionada para la nueva tarea.
   */
  selectCategory(categoryId: string | null): void {
    if (!this._disabled) {
      this.categoryControl.setValue(categoryId);
    }
  }

  /**
   * Selecciona la prioridad de la tarea.
   */
  selectPriority(priority: TaskPriority): void {
    if (!this._disabled) {
      this.priorityControl.setValue(priority);
    }
  }

  /**
   * Selecciona el estado inicial de la tarea.
   */
  selectStatus(status: TaskStatus): void {
    if (!this._disabled) {
      this.statusControl.setValue(status);
    }
  }

  /**
   * Agrega una microtarea temporal al checklist del formulario.
   */
  addSubtask(): void {
    if (this._disabled) {
      return;
    }
    const title = this.subtaskInputControl.value.trim();
    if (!title) {
      return;
    }
    this.subtasks = [
      ...this.subtasks,
      {
        id: `${Date.now()}-${this.subtasks.length}`,
        title,
        completed: false,
      },
    ];
    this.subtaskInputControl.setValue('');
  }

  /**
   * Quita una microtarea pendiente del formulario.
   */
  removeSubtask(subtaskId: string): void {
    if (!this._disabled) {
      this.subtasks = this.subtasks.filter((item) => item.id !== subtaskId);
    }
  }

  /**
   * Valida título y rango de fechas antes de emitir la nueva tarea.
   */
  onSubmit(): void {
    if (this._disabled) {
      return;
    }
    const trimmed = this.titleControl.value.trim();
    if (!trimmed) {
      this.validationError = 'Escribe un título para agregar la tarea.';
      return;
    }

    const startDate = this.startDateControl.value || null;
    const dueDate = this.dueDateControl.value || null;
    if (startDate && dueDate && dueDate < startDate) {
      this.validationError =
        'La fecha límite no puede ser anterior a la fecha inicial.';
      return;
    }

    this.validationError = null;
    this.taskSubmitted.emit({
      title: trimmed,
      categoryId: this.categoryControl.value,
      priority: this.priorityControl.value,
      status: this.statusControl.value,
      description: this.descriptionControl.value.trim(),
      subtasks: this.subtasks.map((item) => ({ ...item })),
      startDate,
      dueDate,
    });
    if (!this.isEditMode) {
      this.resetForm();
    }
  }

  clearValidationError(): void {
    if (this.validationError) {
      this.validationError = null;
    }
  }

  private resetForm(): void {
    this.titleControl.setValue('');
    this.descriptionControl.setValue('');
    this.categoryControl.setValue(null);
    this.priorityControl.setValue('medium');
    this.statusControl.setValue('pending');
    this.startDateControl.setValue('');
    this.dueDateControl.setValue('');
    this.subtaskInputControl.setValue('');
    this.subtasks = [];
  }
}
