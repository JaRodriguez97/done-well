import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCheckbox,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  chevronUpOutline,
  createOutline,
  documentTextOutline,
  flagOutline,
  flameOutline,
  informationCircleOutline,
  listOutline,
  syncOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { CATEGORY_ICON_REGISTRY } from '../../../../core/constants/category.constants';
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TaskPriorityOption,
  TaskStatusOption,
} from '../../../../core/constants/task.constants';
import { Category } from '../../../../core/models/category.model';
import { Task, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    IonCard,
    IonItem,
    IonRow,
    IonCheckbox,
    IonLabel,
    IonList,
    IonText,
    IonChip,
    IonButtons,
    IonButton,
    IonIcon,
  ],
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Input() category: Category | null = null;

  @Output() readonly toggleRequested = new EventEmitter<string>();
  @Output() readonly editRequested = new EventEmitter<Task>();
  @Output() readonly deleteRequested = new EventEmitter<Task>();
  @Output() readonly statusChanged = new EventEmitter<{
    taskId: string;
    status: TaskStatus;
  }>();
  @Output() readonly subtaskToggled = new EventEmitter<{
    taskId: string;
    subtaskId: string;
  }>();

  isExpanded = false;

  constructor() {
    addIcons({
      ...CATEGORY_ICON_REGISTRY,
      createOutline,
      trashOutline,
      flagOutline,
      flameOutline,
      timeOutline,
      syncOutline,
      checkmarkCircleOutline,
      calendarOutline,
      listOutline,
      chevronDownOutline,
      chevronUpOutline,
      documentTextOutline,
      informationCircleOutline,
    });
  }

  get borderClass(): string {
    return `dw-border-${this.category?.colorKey ?? 'pizarra'}`;
  }

  get resolvedStatus(): TaskStatus {
    if (this.task.completed) {
      return 'completed';
    }
    return this.task.status === 'in_progress' ? 'in_progress' : 'pending';
  }

  get priorityOption(): TaskPriorityOption {
    return (
      TASK_PRIORITY_OPTIONS.find(
        (option) => option.key === (this.task.priority ?? 'medium'),
      ) ?? TASK_PRIORITY_OPTIONS[1]
    );
  }

  get statusOption(): TaskStatusOption {
    return (
      TASK_STATUS_OPTIONS.find(
        (option) => option.key === this.resolvedStatus,
      ) ?? TASK_STATUS_OPTIONS[0]
    );
  }

  get totalSubtasksCount(): number {
    return this.task.subtasks?.length ?? 0;
  }

  get completedSubtasksCount(): number {
    return (this.task.subtasks ?? []).filter((item) => item.completed).length;
  }

  get hasDetails(): boolean {
    return Boolean(
      this.task.description ||
      this.totalSubtasksCount > 0 ||
      this.task.startDate ||
      this.task.dueDate,
    );
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  get isOverdue(): boolean {
    if (!this.task.dueDate || this.task.completed) {
      return false;
    }
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return this.task.dueDate < todayIso;
  }

  get dateSummary(): string | null {
    if (this.task.startDate && this.task.dueDate) {
      return `${this.task.startDate} → ${this.task.dueDate}`;
    }
    if (this.task.dueDate) {
      return `Límite: ${this.task.dueDate}`;
    }
    if (this.task.startDate) {
      return `Inicio: ${this.task.startDate}`;
    }
    return null;
  }

  onToggle(): void {
    this.toggleRequested.emit(this.task.id);
  }

  onCycleStatus(): void {
    this.statusChanged.emit({
      taskId: this.task.id,
      status: this.getNextStatus(this.resolvedStatus),
    });
  }

  private getNextStatus(currentStatus: TaskStatus): TaskStatus {
    if (currentStatus === 'pending') {
      return 'in_progress';
    }
    if (currentStatus === 'in_progress') {
      return 'completed';
    }
    return 'pending';
  }

  onSubtaskToggle(subtaskId: string): void {
    this.subtaskToggled.emit({
      taskId: this.task.id,
      subtaskId,
    });
  }

  onEdit(): void {
    this.editRequested.emit(this.task);
  }

  onDelete(): void {
    this.deleteRequested.emit(this.task);
  }
}
