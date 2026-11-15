import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_ICON,
} from '../../../core/constants/category.constants';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys.constants';
import { Category } from '../../../core/models/category.model';
import { StorageService } from '../../../core/services/storage.service';
import { TasksService } from '../../tasks/services/tasks.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj<StorageService>('StorageService', [
      'get',
      'set',
      'remove',
    ]);
    storageSpy.get.and.resolveTo(null);
    storageSpy.set.and.resolveTo();

    tasksServiceSpy = jasmine.createSpyObj<TasksService>('TasksService', [
      'clearCategoryFromTasks',
      'deleteTasksByCategory',
    ]);
    tasksServiceSpy.clearCategoryFromTasks.and.resolveTo();
    tasksServiceSpy.deleteTasksByCategory.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        { provide: StorageService, useValue: storageSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
      ],
    });

    service = TestBed.inject(CategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed and persist default categories on first launch', async () => {
    storageSpy.get.and.resolveTo(null);

    await service.loadCategories();
    const current = await firstValueFrom(service.categories$);

    expect(storageSpy.get).toHaveBeenCalledOnceWith(STORAGE_KEYS.CATEGORIES);
    expect(current.length).toBe(DEFAULT_CATEGORIES.length);
    expect(storageSpy.set).toHaveBeenCalledOnceWith(
      STORAGE_KEYS.CATEGORIES,
      current,
    );
  });

  it('should respect existing stored array without re-seeding defaults', async () => {
    const custom: Category[] = [
      {
        id: 'cat-custom',
        name: '  Salud  ',
        colorKey: 'personal',
        icon: 'person-outline',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    storageSpy.get.and.resolveTo(custom);

    await service.loadCategories();
    const current = await firstValueFrom(service.categories$);

    expect(current.length).toBe(1);
    expect(current[0].name).toBe('Salud');
    expect(storageSpy.set).not.toHaveBeenCalled();
  });

  it('should create a category with chosen or default icon and persist', async () => {
    const created = await service.addCategory({
      name: '  Finanzas  ',
      colorKey: 'compras',
      icon: 'wallet-outline',
    });
    const withFallback = await service.addCategory({
      name: 'General',
      colorKey: 'otros',
    });
    const current = await firstValueFrom(service.categories$);

    expect(created.name).toBe('Finanzas');
    expect(created.icon).toBe('wallet-outline');
    expect(withFallback.icon).toBe(DEFAULT_CATEGORY_ICON);
    expect(current[0]).toEqual(withFallback);
    expect(storageSpy.set).toHaveBeenCalledTimes(2);
  });

  it('should reject creating a category with empty name', async () => {
    await expectAsync(
      service.addCategory({ name: '   ', colorKey: 'trabajo' }),
    ).toBeRejectedWithError('El nombre de la categoría no puede estar vacío.');
    expect(storageSpy.set).not.toHaveBeenCalled();
  });

  it('should update color without overwriting existing icon unless specified', async () => {
    const created = await service.addCategory({
      name: 'Gym',
      colorKey: 'personal',
      icon: 'fitness-outline',
    });
    storageSpy.set.calls.reset();

    await service.updateCategory(created.id, {
      name: 'Bienestar',
      colorKey: 'estudios',
    });
    const current = await firstValueFrom(service.categories$);

    expect(current[0].name).toBe('Bienestar');
    expect(current[0].colorKey).toBe('estudios');
    expect(current[0].icon).toBe('fitness-outline');
    expect(storageSpy.set).toHaveBeenCalledOnceWith(
      STORAGE_KEYS.CATEGORIES,
      current,
    );
  });

  it('should clear category references on tasks when strategy is keep-tasks', async () => {
    const created = await service.addCategory({
      name: 'Temporal',
      colorKey: 'otros',
    });
    storageSpy.set.calls.reset();

    await service.deleteCategory(created.id, 'keep-tasks');
    const current = await firstValueFrom(service.categories$);

    expect(current).toEqual([]);
    expect(storageSpy.set).toHaveBeenCalledOnceWith(STORAGE_KEYS.CATEGORIES, []);
    expect(tasksServiceSpy.clearCategoryFromTasks).toHaveBeenCalledOnceWith(
      created.id,
    );
    expect(tasksServiceSpy.deleteTasksByCategory).not.toHaveBeenCalled();
  });

  it('should delete associated tasks when strategy is delete-tasks', async () => {
    const created = await service.addCategory({
      name: 'Temporal',
      colorKey: 'urgente',
    });
    storageSpy.set.calls.reset();

    await service.deleteCategory(created.id, 'delete-tasks');

    expect(tasksServiceSpy.deleteTasksByCategory).toHaveBeenCalledOnceWith(
      created.id,
    );
    expect(tasksServiceSpy.clearCategoryFromTasks).not.toHaveBeenCalled();
  });
});
