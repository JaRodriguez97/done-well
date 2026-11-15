import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
  IonLabel,
  IonList,
  IonRow,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { appsOutline, filterOutline } from 'ionicons/icons';
import { CATEGORY_ICON_REGISTRY } from '../../../../core/constants/category.constants';
import { Category } from '../../../../core/models/category.model';
import { Task } from '../../../../core/models/task.model';

export type TaskFilterValue = 'all' | 'uncategorized' | string;

@Component({
  selector: 'app-task-category-filter',
  templateUrl: './task-category-filter.component.html',
  styleUrls: ['./task-category-filter.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonRow,
    IonList,
    IonChip,
    IonIcon,
    IonLabel,
    IonBadge,
    IonText,
  ],
})
export class TaskCategoryFilterComponent {
  @Input() categories: Category[] = [];
  @Input() tasks: Task[] = [];
  @Input() selectedFilter: TaskFilterValue = 'all';

  @Output() readonly filterChanged = new EventEmitter<TaskFilterValue>();

  constructor() {
    addIcons({
      ...CATEGORY_ICON_REGISTRY,
      appsOutline,
      filterOutline,
    });
  }

  /**
   * Emite el filtro seleccionado hacia la vista principal de tareas.
   */
  selectFilter(filter: TaskFilterValue): void {
    this.filterChanged.emit(filter);
  }

  /**
   * Calcula cuántas tareas coinciden con el criterio de filtro indicado.
   */
  countByFilter(filter: TaskFilterValue): number {
    if (filter === 'all') {
      return this.tasks.length;
    }
    if (filter === 'uncategorized') {
      return this.tasks.filter((task) => task.categoryId === null).length;
    }
    return this.tasks.filter((task) => task.categoryId === filter).length;
  }
}
