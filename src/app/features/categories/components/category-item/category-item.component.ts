import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, createOutline, trashOutline } from 'ionicons/icons';
import { CATEGORY_ICON_REGISTRY } from '../../../../core/constants/category.constants';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    IonCard,
    IonItem,
    IonIcon,
    IonLabel,
    IonText,
    IonBadge,
    IonButtons,
    IonButton,
  ],
})
export class CategoryItemComponent {
  @Input({ required: true }) category!: Category;
  @Input() taskCount = 0;
  @Input() completedTaskCount = 0;
  @Input() isExpanded = false;
  @Input() isLast = false;

  @Output() readonly editRequested = new EventEmitter<Category>();
  @Output() readonly deleteRequested = new EventEmitter<Category>();
  @Output() readonly toggleRequested = new EventEmitter<void>();
  @Output() readonly viewTasksRequested = new EventEmitter<Category>();

  constructor() {
    addIcons({
      ...CATEGORY_ICON_REGISTRY,
      createOutline,
      trashOutline,
      arrowForwardOutline,
    });
  }

  get borderClass(): string {
    return `dw-border-${this.category.colorKey}`;
  }

  get glassClass(): string {
    return `category-card--${this.category.colorKey}`;
  }

  onCardClick(): void {
    this.toggleRequested.emit();
  }

  onViewTasks(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.viewTasksRequested.emit(this.category);
  }

  onEdit(event?: Event): void {
    event?.stopPropagation();
    this.editRequested.emit(this.category);
  }

  onDelete(event?: Event): void {
    event?.stopPropagation();
    this.deleteRequested.emit(this.category);
  }
}
