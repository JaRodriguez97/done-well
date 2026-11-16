import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  AlertButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  closeOutline,
  pricetagsOutline,
} from 'ionicons/icons';
import { combineLatest } from 'rxjs';
import {
  Category,
  CategoryPayload,
} from '../../../../core/models/category.model';
import { Task } from '../../../../core/models/task.model';
import { TasksService } from '../../../tasks/services/tasks.service';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';
import { CategoryItemComponent } from '../../components/category-item/category-item.component';
import {
  CategoriesService,
  CategoryDeleteStrategy,
} from '../../services/categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonSpinner,
    IonIcon,
    IonText,
    IonButton,
    IonButtons,
    IonModal,
    CategoryFormComponent,
    CategoryItemComponent,
  ],
})
export class CategoriesPage implements OnInit {
  readonly viewState$ = combineLatest({
    categories: this.categoriesService.categories$,
    tasks: this.tasksService.tasks$,
  });

  isLoading = true;
  errorMessage: string | null = null;
  editingCategory: Category | null = null;
  isFormModalOpen = false;
  expandedCategoryId: string | null = null;

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly tasksService: TasksService,
    private readonly alertController: AlertController,
    private readonly router: Router,
  ) {
    addIcons({
      pricetagsOutline,
      alertCircleOutline,
      addCircleOutline,
      closeOutline,
    });
  }

  ngOnInit(): void {
    void this.initializeData();
  }

  /**
   * Carga categorías y tareas locales para mostrar el listado y sus conteos asociados.
   */
  async initializeData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      await Promise.all([
        this.categoriesService.loadCategories(),
        this.tasksService.loadTasks(),
      ]);
    } catch {
      this.errorMessage = 'No se pudieron cargar las categorías almacenadas.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Abre el modal limpio para registrar una nueva categoría.
   */
  openCreateModal(): void {
    this.errorMessage = null;
    this.editingCategory = null;
    this.isFormModalOpen = true;
  }

  /**
   * Crea una nueva categoría o actualiza la que se encuentra en edición.
   */
  async onSaveCategory(payload: CategoryPayload): Promise<void> {
    this.errorMessage = null;
    try {
      if (this.editingCategory) {
        await this.categoriesService.updateCategory(this.editingCategory.id, payload);
      } else {
        await this.categoriesService.addCategory(payload);
      }
      this.onCloseFormModal();
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'No se pudo guardar la categoría.';
    }
  }

  onStartEdit(category: Category): void {
    this.errorMessage = null;
    this.editingCategory = category;
    this.isFormModalOpen = true;
  }

  onCancelEdit(): void {
    this.onCloseFormModal();
  }

  onCloseFormModal(): void {
    this.isFormModalOpen = false;
    this.editingCategory = null;
  }

  /**
   * Solicita confirmación mediante AlertController antes de eliminar una categoría.
   */
  async confirmDeleteCategory(category: Category, tasks: Task[]): Promise<void> {
    const taskCount = this.countTasksByCategory(tasks, category.id);
    const buttons: AlertButton[] =
      taskCount > 0
        ? [
            {
              text: 'Conservar tareas (sin categoría)',
              handler: () => this.onDeleteCategory(category.id, 'keep-tasks'),
            },
            {
              text: 'Eliminar categoría y tareas',
              role: 'destructive',
              handler: () => this.onDeleteCategory(category.id, 'delete-tasks'),
            },
            {
              text: 'Cancelar',
              role: 'cancel',
            },
          ]
        : [
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar categoría',
              role: 'destructive',
              handler: () => this.onDeleteCategory(category.id, 'keep-tasks'),
            },
          ];

    const message =
      taskCount > 0
        ? `La categoría "${category.name}" tiene ${taskCount} ${
            taskCount === 1 ? 'tarea asignada' : 'tareas asignadas'
          }. ¿Qué deseas hacer con ellas?`
        : `¿Deseas eliminar la categoría "${category.name}"?`;

    const alert = await this.alertController.create({
      header: 'Eliminar categoría',
      message,
      buttons,
    });

    await alert.present();
  }

  /**
   * Ejecuta la eliminación de la categoría con la estrategia seleccionada.
   */
  async onDeleteCategory(
    categoryId: string,
    strategy: CategoryDeleteStrategy = 'keep-tasks',
  ): Promise<void> {
    this.errorMessage = null;
    try {
      await this.categoriesService.deleteCategory(categoryId, strategy);
      if (this.editingCategory?.id === categoryId) {
        this.editingCategory = null;
      }
      if (this.expandedCategoryId === categoryId) {
        this.expandedCategoryId = null;
      }
    } catch {
      this.errorMessage = 'No se pudo eliminar la categoría.';
    }
  }

  onToggleCategory(categoryId: string): void {
    this.expandedCategoryId =
      this.expandedCategoryId === categoryId ? null : categoryId;
  }

  isCardExpanded(categoryId: string): boolean {
    return this.expandedCategoryId === categoryId;
  }

  isCardPushedDown(categories: Category[], currentId: string): boolean {
    if (!this.expandedCategoryId) {
      return false;
    }
    const expandedIdx = categories.findIndex(
      (c) => c.id === this.expandedCategoryId,
    );
    const currentIdx = categories.findIndex((c) => c.id === currentId);
    return expandedIdx !== -1 && currentIdx > expandedIdx;
  }

  goToTasksByCategory(categoryId: string): void {
    void this.router.navigate(['/tabs/tab1'], {
      queryParams: { categoryId },
    });
  }

  countTasksByCategory(tasks: Task[], categoryId: string): number {
    return tasks.filter((task) => task.categoryId === categoryId).length;
  }

  countCompletedTasksByCategory(tasks: Task[], categoryId: string): number {
    return tasks.filter(
      (task) => task.categoryId === categoryId && task.completed,
    ).length;
  }
}
