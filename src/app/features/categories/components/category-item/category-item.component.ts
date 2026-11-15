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
import { createOutline, trashOutline } from 'ionicons/icons';
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

  @Output() readonly editRequested = new EventEmitter<Category>();
  @Output() readonly deleteRequested = new EventEmitter<Category>();

  constructor() {
    addIcons({
      ...CATEGORY_ICON_REGISTRY,
      createOutline,
      trashOutline,
    });
  }

  get borderClass(): string {
    return `dw-border-${this.category.colorKey}`;
  }

  onEdit(): void {
    this.editRequested.emit(this.category);
  }

  onDelete(): void {
    this.deleteRequested.emit(this.category);
  }
}
