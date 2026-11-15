import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCheckbox,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { CATEGORY_ICON_REGISTRY } from '../../../../core/constants/category.constants';
import { Category } from '../../../../core/models/category.model';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    IonCard,
    IonItem,
    IonCheckbox,
    IonLabel,
    IonText,
    IonChip,
    IonButton,
    IonIcon,
  ],
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Input() category: Category | null = null;

  @Output() readonly toggleRequested = new EventEmitter<string>();
  @Output() readonly deleteRequested = new EventEmitter<Task>();

  constructor() {
    addIcons({
      ...CATEGORY_ICON_REGISTRY,
      trashOutline,
    });
  }

  get borderClass(): string {
    return `dw-border-${this.category?.colorKey ?? 'otros'}`;
  }

  onToggle(): void {
    this.toggleRequested.emit(this.task.id);
  }

  onDelete(): void {
    this.deleteRequested.emit(this.task);
  }
}
