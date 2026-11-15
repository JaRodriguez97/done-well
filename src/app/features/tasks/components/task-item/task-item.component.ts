import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonCheckbox, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  standalone: true,
  imports: [IonCheckbox, IonButton, IonIcon],
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Output() readonly toggleRequested = new EventEmitter<string>();
  @Output() readonly deleteRequested = new EventEmitter<string>();

  constructor() {
    addIcons({ trashOutline });
  }

  onToggle(): void {
    this.toggleRequested.emit(this.task.id);
  }

  onDelete(): void {
    this.deleteRequested.emit(this.task.id);
  }
}
