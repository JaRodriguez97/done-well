import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_ICON,
} from '../../../core/constants/category.constants';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys.constants';
import {
  Category,
  CategoryItem,
  CategoryPayload,
} from '../../../core/models/category.model';
import { StorageService } from '../../../core/services/storage.service';
import { TasksService } from '../../tasks/services/tasks.service';

export type CategoryDeleteStrategy = 'keep-tasks' | 'delete-tasks';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
  readonly categories$: Observable<Category[]> = this.categoriesSubject.asObservable();

  constructor(
    private readonly storageService: StorageService,
    private readonly tasksService: TasksService,
  ) {}

  /**
   * Carga las categorías almacenadas o inicializa las categorías por defecto en el primer arranque.
   */
  async loadCategories(): Promise<void> {
    const stored = await this.storageService.get<Category[]>(STORAGE_KEYS.CATEGORIES);
    if (stored === null) {
      const defaults = DEFAULT_CATEGORIES.map((item) => new CategoryItem(item).toPlainObject());
      await this.persistCategories(defaults);
      return;
    }
    const validCategories = stored.map((item) => new CategoryItem(item).toPlainObject());
    this.categoriesSubject.next(validCategories);
  }

  /**
   * Crea una nueva categoría validada y la guarda al inicio de la lista.
   */
  async addCategory(params: CategoryPayload): Promise<Category> {
    const newCategory = new CategoryItem({
      name: params.name,
      colorKey: params.colorKey,
      icon: params.icon ?? DEFAULT_CATEGORY_ICON,
    }).toPlainObject();
    const updatedCategories = [newCategory, ...this.categoriesSubject.value];
    await this.persistCategories(updatedCategories);
    return newCategory;
  }

  /**
   * Actualiza los datos editables de una categoría existente y persiste el cambio.
   */
  async updateCategory(
    categoryId: string,
    changes: Partial<CategoryPayload>,
  ): Promise<void> {
    const targetExists = this.categoriesSubject.value.some((item) => item.id === categoryId);
    if (!targetExists) {
      return;
    }

    const updatedCategories = this.categoriesSubject.value.map((item) => {
      if (item.id !== categoryId) {
        return item;
      }
      const entity = new CategoryItem(item);
      entity.update(changes);
      return entity.toPlainObject();
    });

    await this.persistCategories(updatedCategories);
  }

  /**
   * Elimina una categoría aplicando la estrategia elegida sobre sus tareas asociadas.
   */
  async deleteCategory(
    categoryId: string,
    strategy: CategoryDeleteStrategy = 'keep-tasks',
  ): Promise<void> {
    const updatedCategories = this.categoriesSubject.value.filter(
      (item) => item.id !== categoryId,
    );
    await this.persistCategories(updatedCategories);

    if (strategy === 'delete-tasks') {
      await this.tasksService.deleteTasksByCategory(categoryId);
      return;
    }
    await this.tasksService.clearCategoryFromTasks(categoryId);
  }

  private async persistCategories(categories: Category[]): Promise<void> {
    await this.storageService.set(STORAGE_KEYS.CATEGORIES, categories);
    this.categoriesSubject.next(categories);
  }
}
