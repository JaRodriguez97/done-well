import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  checkmarkDoneCircleOutline,
  closeOutline,
  filterOutline,
} from 'ionicons/icons';
import { combineLatest } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { Task, TaskPayload } from '../../../../core/models/task.model';
import { CategoriesService } from '../../../categories/services/categories.service';
import {
  TaskCategoryFilterComponent,
  TaskFilterValue,
} from '../../components/task-category-filter/task-category-filter.component';
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
    IonButton,
    IonButtons,
    IonModal,
    IonSpinner,
    IonIcon,
    IonText,
    TaskFormComponent,
    TaskCategoryFilterComponent,
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
  selectedFilter: TaskFilterValue = 'all';
  isCreateModalOpen = false;

  constructor(
    private readonly tasksService: TasksService,
    private readonly categoriesService: CategoriesService,
    private readonly alertController: AlertController,
  ) {
    addIcons({
      checkmarkDoneCircleOutline,
      alertCircleOutline,
      filterOutline,
      addCircleOutline,
      closeOutline,
    });
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
   * Abre el modal para registrar una nueva tarea.
   */
  openCreateTaskModal(): void {
    this.errorMessage = null;
    this.isCreateModalOpen = true;
  }

  /**
   * Cierra el modal de creación de tareas.
   */
  closeCreateTaskModal(): void {
    this.isCreateModalOpen = false;
  }

  /**
   * Crea una nueva tarea con su título y categoría asignada.
   */
  async onCreateTask(payload: TaskPayload): Promise<void> {
    this.errorMessage = null;
    try {
      await this.tasksService.addTask(payload.title, payload.categoryId);
      this.closeCreateTaskModal();
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

  /**
   * Actualiza el filtro de categoría activo en la vista de tareas.
   */
  onFilterChange(filter: TaskFilterValue): void {
    this.selectedFilter = filter;
  }

  /**
   * Restablece el filtro a todas las tareas si la categoría filtrada fue eliminada.
   */
  resolveActiveFilter(categories: Category[]): TaskFilterValue {
    if (this.selectedFilter === 'all' || this.selectedFilter === 'uncategorized') {
      return this.selectedFilter;
    }
    const categoryExists = categories.some(
      (category) => category.id === this.selectedFilter,
    );
    return categoryExists ? this.selectedFilter : 'all';
  }

  /**
   * Retorna las tareas visibles según el filtro de categoría seleccionado.
   */
  filterTasks(tasks: Task[], categories: Category[]): Task[] {
    const activeFilter = this.resolveActiveFilter(categories);
    if (activeFilter === 'all') {
      return tasks;
    }
    if (activeFilter === 'uncategorized') {
      return tasks.filter((task) => task.categoryId === null);
    }
    return tasks.filter((task) => task.categoryId === activeFilter);
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
