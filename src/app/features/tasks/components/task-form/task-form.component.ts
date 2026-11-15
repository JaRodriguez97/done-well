import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonInput, IonButton, IonIcon],
})
export class TaskFormComponent {
  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
    if (value) {
      this.titleControl.disable({ emitEvent: false });
    } else {
      this.titleControl.enable({ emitEvent: false });
    }
  }

  @Output() readonly taskSubmitted = new EventEmitter<string>();

  readonly titleControl = new FormControl('', { nonNullable: true });
  validationError: string | null = null;

  constructor() {
    addIcons({ addCircleOutline, alertCircleOutline });
  }

  /**
   * Valida el título ingresado y emite el valor limpio al componente padre.
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
    this.taskSubmitted.emit(trimmed);
    this.titleControl.setValue('');
  }

  clearValidationError(): void {
    if (this.validationError) {
      this.validationError = null;
    }
  }
}
