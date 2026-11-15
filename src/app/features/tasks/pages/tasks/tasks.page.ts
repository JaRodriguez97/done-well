import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkDoneCircleOutline } from 'ionicons/icons';
import { combineLatest } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { Task, TaskPayload } from '../../../../core/models/task.model';
import { CategoriesService } from '../../../categories/services/categories.service';
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
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonSpinner,
    IonIcon,
    IonText,
    TaskFormComponent,
    TaskItemComponent,
  ],
})
export class TasksPage implements OnInit {
  readonly viewState$ = combineLatest({
    tasks: this.tasksService.tasks$,
    categories: this.categoriesService.categories$,
  });

  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private readonly tasksService: TasksService,
    private readonly categoriesService: CategoriesService,
    private readonly alertController: AlertController,
  ) {
    addIcons({ checkmarkDoneCircleOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    void this.initializeTasks();
  }

  /**
   * Carga las tareas y categorías almacenadas localmente manejando carga y error.
   */
  async initializeTasks(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      await Promise.all([
        this.tasksService.loadTasks(),
        this.categoriesService.loadCategories(),
      ]);
    } catch {
      this.errorMessage = 'No se pudieron cargar las tareas almacenadas.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Crea una nueva tarea con su título y categoría asignada.
   */
  async onCreateTask(payload: TaskPayload): Promise<void> {
    this.errorMessage = null;
    try {
      await this.tasksService.addTask(payload.title, payload.categoryId);
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

  /**
   * Muestra una confirmación mediante AlertController antes de eliminar una tarea.
   */
  async confirmDeleteTask(task: Task): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar tarea',
      message: `¿Deseas eliminar "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.onDeleteTask(task.id),
        },
      ],
    });

    await alert.present();
  }

  async onDeleteTask(taskId: string): Promise<void> {
    this.errorMessage = null;
    try {
      await this.tasksService.deleteTask(taskId);
    } catch {
      this.errorMessage = 'No se pudo eliminar la tarea.';
    }
  }

  findCategory(categories: Category[], categoryId: string | null): Category | null {
    if (!categoryId) {
      return null;
    }
    return categories.find((category) => category.id === categoryId) ?? null;
  }

  countCompleted(tasks: Task[]): number {
    return tasks.filter((task) => task.completed).length;
  }

  countPending(tasks: Task[]): number {
    return tasks.filter((task) => !task.completed).length;
  }
}
