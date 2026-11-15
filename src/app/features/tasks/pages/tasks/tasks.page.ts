import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkDoneCircleOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { Task } from '../../../../core/models/task.model';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonIcon,
    TaskFormComponent,
    TaskItemComponent,
  ],
})
export class TasksPage implements OnInit {
  readonly tasks$: Observable<Task[]> = this.tasksService.tasks$;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private readonly tasksService: TasksService) {
    addIcons({ checkmarkDoneCircleOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    void this.initializeTasks();
  }

  /**
   * Carga las tareas desde almacenamiento local manejando estado de carga y error.
   */
  async initializeTasks(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      await this.tasksService.loadTasks();
    } catch {
      this.errorMessage = 'No se pudieron cargar las tareas almacenadas.';
    } finally {
      this.isLoading = false;
    }
  }

  async onCreateTask(title: string): Promise<void> {
    this.errorMessage = null;
    try {
      await this.tasksService.addTask(title);
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'No se pudo guardar la tarea.';
    }
  }

  async onToggleTask(taskId: string): Promise<void> {
    this.errorMessage = null;
    try {
      await this.tasksService.toggleTask(taskId);
    } catch {
      this.errorMessage = 'No se pudo actualizar el estado de la tarea.';
    }
  }

  async onDeleteTask(taskId: string): Promise<void> {
    this.errorMessage = null;
    try {
      await this.tasksService.deleteTask(taskId);
    } catch {
      this.errorMessage = 'No se pudo eliminar la tarea.';
    }
  }

  countCompleted(tasks: Task[]): number {
    return tasks.filter((task) => task.completed).length;
  }

  countPending(tasks: Task[]): number {
    return tasks.filter((task) => !task.completed).length;
  }
}
