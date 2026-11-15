import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { CATEGORY_ICON_REGISTRY } from '../../../../core/constants/category.constants';
import { Category } from '../../../../core/models/category.model';
import { TaskPayload } from '../../../../core/models/task.model';

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
    IonItem,
    IonInput,
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

  @Input() categories: Category[] = [];

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
    if (value) {
      this.titleControl.disable({ emitEvent: false });
      this.categoryControl.disable({ emitEvent: false });
    } else {
      this.titleControl.enable({ emitEvent: false });
      this.categoryControl.enable({ emitEvent: false });
    }
  }

  @Output() readonly taskSubmitted = new EventEmitter<TaskPayload>();

  readonly titleControl = new FormControl('', { nonNullable: true });
  readonly categoryControl = new FormControl<string | null>(null);
  validationError: string | null = null;

  constructor() {
    addIcons({
      ...CATEGORY_ICON_REGISTRY,
      addCircleOutline,
      alertCircleOutline,
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
   * Valida el título ingresado y emite la tarea con su categoría seleccionada.
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

    this.validationError = null;
    this.taskSubmitted.emit({
      title: trimmed,
      categoryId: this.categoryControl.value,
    });
    this.titleControl.setValue('');
    this.categoryControl.setValue(null);
  }

  clearValidationError(): void {
    if (this.validationError) {
      this.validationError = null;
    }
  }
}
