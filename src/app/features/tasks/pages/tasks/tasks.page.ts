import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
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
  IonSearchbar,
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
  searchOutline,
} from 'ionicons/icons';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../../../../core/models/category.model';
import {
  Task,
  TaskPayload,
  TaskStatus
} from '../../../../core/models/task.model';
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
    IonSearchbar,
    IonSpinner,
    IonIcon,
    IonText,
    TaskFormComponent,
    TaskCategoryFilterComponent,
    TaskItemComponent,
  ],
})
export class TasksPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterSubject = new BehaviorSubject<TaskFilterValue>('all');
  private readonly searchSubject = new BehaviorSubject<string>('');

  get selectedFilter(): TaskFilterValue {
    return this.filterSubject.value;
  }
  set selectedFilter(value: TaskFilterValue) {
    if (this.filterSubject.value !== value) {
      this.filterSubject.next(value);
    }
  }

  get searchQuery(): string {
    return this.searchSubject.value;
  }
  set searchQuery(value: string) {
    if (this.searchSubject.value !== value) {
      this.searchSubject.next(value);
    }
  }

  readonly viewState$ = combineLatest({
    tasks: this.tasksService.tasks$,
    categories: this.categoriesService.categories$,
    filter: this.filterSubject,
    search: this.searchSubject,
  }).pipe(
    map(({ tasks, categories }) => {
      const activeFilter = this.resolveActiveFilter(categories);
      const filtered = this.filterTasks(tasks, categories);
      return {
        tasks,
        categories,
        filteredTasks: filtered.map((task) => ({
          task,
          category: this.findCategory(categories, task.categoryId),
        })),
        pendingCount: this.countPending(tasks),
        completedCount: this.countCompleted(tasks),
        activeFilter,
        searchQuery: this.searchQuery,
      };
    }),
  );

  isLoading = true;
  errorMessage: string | null = null;
  isCreateModalOpen = false;
  taskToEdit: Task | null = null;

  constructor(
    private readonly tasksService: TasksService,
    private readonly categoriesService: CategoriesService,
    private readonly alertController: AlertController,
    private readonly route: ActivatedRoute,
  ) {
    addIcons({
      checkmarkDoneCircleOutline,
      alertCircleOutline,
      filterOutline,
      addCircleOutline,
      closeOutline,
      searchOutline,
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const categoryId = params.get('categoryId');
        if (categoryId) {
          this.selectedFilter = categoryId;
        }
      });
    void this.initializeTasks();
  }

  ionViewWillEnter(): void {
    const categoryId = this.route.snapshot.queryParamMap.get('categoryId');
    if (categoryId) {
      this.selectedFilter = categoryId;
    }
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
    this.taskToEdit = null;
    this.isCreateModalOpen = true;
  }

  /**
   * Abre el modal para editar una tarea existente.
   */
  openEditTaskModal(task: Task): void {
    this.errorMessage = null;
    this.taskToEdit = task;
    this.isCreateModalOpen = true;
  }

  /**
   * Cierra el modal de creación o edición de tareas.
   */
  closeCreateTaskModal(): void {
    this.isCreateModalOpen = false;
    this.taskToEdit = null;
  }

  /**
   * Guarda una tarea (creación o edición) con su título, categoría y detalles.
   */
  async onSaveTask(payload: TaskPayload): Promise<void> {
    this.errorMessage = null;
    try {
      if (this.taskToEdit) {
        await this.tasksService.updateTask(this.taskToEdit.id, payload);
      } else {
        const { title, categoryId, ...details } = payload;
        const hasDetails = Object.values(details).some(
          (value) => value !== undefined,
        );
        if (hasDetails) {
          await this.tasksService.addTask(title, categoryId, details);
        } else {
          await this.tasksService.addTask(title, categoryId);
        }
      }
      this.closeCreateTaskModal();
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'No se pudo guardar la tarea.';
    }
  }

  /**
   * Crea una nueva tarea (mantenido para retrocompatibilidad).
   */
  async onCreateTask(payload: TaskPayload): Promise<void> {
    await this.onSaveTask(payload);
  }

  async onToggleTask(taskId: string): Promise<void> {
    await this.runTaskAction(
      () => this.tasksService.toggleTask(taskId),
      'No se pudo actualizar el estado de la tarea.',
    );
  }

  async onStatusChange(event: {
    taskId: string;
    status: TaskStatus;
  }): Promise<void> {
    await this.runTaskAction(
      () => this.tasksService.updateTaskStatus(event.taskId, event.status),
      'No se pudo actualizar el estado de la tarea.',
    );
  }

  async onSubtaskToggle(event: {
    taskId: string;
    subtaskId: string;
  }): Promise<void> {
    await this.runTaskAction(
      () => this.tasksService.toggleSubtask(event.taskId, event.subtaskId),
      'No se pudo actualizar la microtarea.',
    );
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
    await this.runTaskAction(
      () => this.tasksService.deleteTask(taskId),
      'No se pudo eliminar la tarea.',
    );
  }

  private async runTaskAction(
    action: () => Promise<void>,
    fallbackMessage: string,
  ): Promise<void> {
    this.errorMessage = null;
    try {
      await action();
    } catch {
      this.errorMessage = fallbackMessage;
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
    if (
      this.selectedFilter === 'all' ||
      this.selectedFilter === 'uncategorized'
    ) {
      return this.selectedFilter;
    }
    const categoryExists = categories.some(
      (category) => category.id === this.selectedFilter,
    );
    return categoryExists ? this.selectedFilter : 'all';
  }

  onSearchInput(event: CustomEvent<{ value?: string | null }>): void {
    this.searchQuery = event.detail.value ?? '';
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  /**
   * Retorna las tareas visibles según el filtro de categoría y el término de búsqueda.
   */
  filterTasks(tasks: Task[], categories: Category[]): Task[] {
    const activeFilter = this.resolveActiveFilter(categories);
    let filtered: Task[];

    if (activeFilter === 'all') {
      filtered = tasks;
    } else if (activeFilter === 'uncategorized') {
      filtered = tasks.filter((task) => task.categoryId === null);
    } else {
      filtered = tasks.filter((task) => task.categoryId === activeFilter);
    }

    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return filtered;
    }

    return filtered.filter((task) => {
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDescription = (task.description ?? '')
        .toLowerCase()
        .includes(query);
      const matchSubtasks = (task.subtasks ?? []).some((sub) =>
        sub.title.toLowerCase().includes(query),
      );
      return matchTitle || matchDescription || matchSubtasks;
    });
  }

  findCategory(
    categories: Category[],
    categoryId: string | null,
  ): Category | null {
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
