import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AlertButton, AlertController } from '@ionic/angular/standalone';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { Task } from '../../../../core/models/task.model';
import { createMockCategory } from '../../../../core/testing/test-fixtures';
import { TasksService } from '../../../tasks/services/tasks.service';
import { CategoriesService } from '../../services/categories.service';
import { CategoriesPage } from './categories.page';

describe('CategoriesPage', () => {
  let component: CategoriesPage;
  let fixture: ComponentFixture<CategoriesPage>;
  let categoriesSubject: BehaviorSubject<Category[]>;
  let tasksSubject: BehaviorSubject<Task[]>;
  let categoriesServiceSpy: jasmine.SpyObj<CategoriesService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let alertElementSpy: jasmine.SpyObj<HTMLIonAlertElement>;

  const sampleCategory: Category = createMockCategory({
    id: 'cat-trabajo',
    name: 'Trabajo',
    colorKey: 'violeta',
    icon: 'briefcase-outline',
  });

  beforeEach(async () => {
    categoriesSubject = new BehaviorSubject<Category[]>([sampleCategory]);
    tasksSubject = new BehaviorSubject<Task[]>([]);

    categoriesServiceSpy = jasmine.createSpyObj<CategoriesService>(
      'CategoriesService',
      ['loadCategories', 'addCategory', 'updateCategory', 'deleteCategory'],
      { categories$: categoriesSubject.asObservable() },
    );
    categoriesServiceSpy.loadCategories.and.resolveTo();
    categoriesServiceSpy.addCategory.and.resolveTo(sampleCategory);
    categoriesServiceSpy.updateCategory.and.resolveTo();
    categoriesServiceSpy.deleteCategory.and.resolveTo();

    tasksServiceSpy = jasmine.createSpyObj<TasksService>(
      'TasksService',
      ['loadTasks'],
      { tasks$: tasksSubject.asObservable() },
    );
    tasksServiceSpy.loadTasks.and.resolveTo();

    alertElementSpy = jasmine.createSpyObj<HTMLIonAlertElement>(
      'HTMLIonAlertElement',
      ['present'],
    );
    alertElementSpy.present.and.resolveTo();

    alertControllerSpy = jasmine.createSpyObj<AlertController>(
      'AlertController',
      ['create'],
    );
    alertControllerSpy.create.and.resolveTo(alertElementSpy);

    await TestBed.configureTestingModule({
      imports: [CategoriesPage],
      providers: [
        provideRouter([]),
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load categories and tasks on init', () => {
    expect(component).toBeTruthy();
    expect(categoriesServiceSpy.loadCategories).toHaveBeenCalledTimes(1);
    expect(tasksServiceSpy.loadTasks).toHaveBeenCalledTimes(1);
  });

  it('should open modal cleanly in create and edit modes and close it on cancel or dismiss', () => {
    expect(component.isFormModalOpen).toBeFalse();

    component.onStartEdit(sampleCategory);
    expect(component.editingCategory).toEqual(sampleCategory);
    expect(component.isFormModalOpen).toBeTrue();

    component.onCancelEdit();
    expect(component.isFormModalOpen).toBeFalse();
    expect(component.editingCategory).toBeNull();

    component.openCreateModal();
    expect(component.isFormModalOpen).toBeTrue();
    expect(component.editingCategory).toBeNull();

    component.onCloseFormModal();
    expect(component.isFormModalOpen).toBeFalse();
    expect(component.editingCategory).toBeNull();
  });

  it('should create or update a category depending on edit mode and close modal on success', async () => {
    component.openCreateModal();
    await component.onSaveCategory({
      name: 'Salud',
      colorKey: 'turquesa',
    });
    expect(categoriesServiceSpy.addCategory).toHaveBeenCalledTimes(1);
    expect(component.isFormModalOpen).toBeFalse();
    expect(component.editingCategory).toBeNull();

    component.onStartEdit(sampleCategory);
    expect(component.isFormModalOpen).toBeTrue();

    await component.onSaveCategory({
      name: 'Oficina',
      colorKey: 'violeta',
    });
    expect(categoriesServiceSpy.updateCategory).toHaveBeenCalledOnceWith(
      'cat-trabajo',
      {
        name: 'Oficina',
        colorKey: 'violeta',
      },
    );
    expect(component.isFormModalOpen).toBeFalse();
    expect(component.editingCategory).toBeNull();
  });

  it('should keep modal open and expose errorMessage when saving category fails', async () => {
    categoriesServiceSpy.addCategory.and.rejectWith(
      new Error('Ya existe una categoría con ese nombre.'),
    );

    component.openCreateModal();
    await component.onSaveCategory({
      name: 'Trabajo',
      colorKey: 'violeta',
    });

    expect(component.isFormModalOpen).toBeTrue();
    expect(component.errorMessage).toBe('Ya existe una categoría con ese nombre.');
  });

  it('should present two delete strategies in AlertController when category has assigned tasks', async () => {
    const tasks: Task[] = [
      {
        id: 't-1',
        title: 'Enviar informe',
        completed: false,
        categoryId: 'cat-trabajo',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    await component.confirmDeleteCategory(sampleCategory, tasks);

    expect(alertControllerSpy.create).toHaveBeenCalledTimes(1);
    expect(alertElementSpy.present).toHaveBeenCalledTimes(1);

    const options = alertControllerSpy.create.calls.mostRecent().args[0];
    const buttons = (options?.buttons ?? []) as AlertButton[];
    const keepButton = buttons.find((btn) =>
      btn.text.includes('Conservar tareas'),
    );
    const deleteAllButton = buttons.find((btn) =>
      btn.text.includes('Eliminar categoría y tareas'),
    );

    expect(keepButton).toBeDefined();
    expect(deleteAllButton).toBeDefined();

    await keepButton?.handler?.(undefined);
    expect(categoriesServiceSpy.deleteCategory).toHaveBeenCalledWith(
      'cat-trabajo',
      'keep-tasks',
    );

    await deleteAllButton?.handler?.(undefined);
    expect(categoriesServiceSpy.deleteCategory).toHaveBeenCalledWith(
      'cat-trabajo',
      'delete-tasks',
    );
  });

  it('should present standard delete confirmation when category has no tasks', async () => {
    await component.confirmDeleteCategory(sampleCategory, []);

    const options = alertControllerSpy.create.calls.mostRecent().args[0];
    const buttons = (options?.buttons ?? []) as AlertButton[];
    const confirmButton = buttons.find(
      (btn) => btn.text === 'Eliminar categoría',
    );

    expect(buttons.length).toBe(2);
    await confirmButton?.handler?.(undefined);
    expect(categoriesServiceSpy.deleteCategory).toHaveBeenCalledOnceWith(
      'cat-trabajo',
      'keep-tasks',
    );
  });

  it('should count total and completed tasks by category', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'T1',
        completed: true,
        categoryId: 'cat-trabajo',
        createdAt: '2025-01-01',
      },
      {
        id: '2',
        title: 'T2',
        completed: false,
        categoryId: 'cat-trabajo',
        createdAt: '2025-01-01',
      },
      {
        id: '3',
        title: 'T3',
        completed: true,
        categoryId: 'cat-otro',
        createdAt: '2025-01-01',
      },
    ];
    expect(component.countTasksByCategory(tasks, 'cat-trabajo')).toBe(2);
    expect(
      component.countCompletedTasksByCategory(tasks, 'cat-trabajo'),
    ).toBe(1);
  });

  it('should toggle expandedCategoryId when onToggleCategory is called', () => {
    expect(component.expandedCategoryId).toBeNull();

    component.onToggleCategory('cat-trabajo');
    expect(component.expandedCategoryId).toBe('cat-trabajo');

    // Tapping the same category collapses it
    component.onToggleCategory('cat-trabajo');
    expect(component.expandedCategoryId).toBeNull();

    // Tapping another category switches to it
    component.onToggleCategory('cat-estudios');
    expect(component.expandedCategoryId).toBe('cat-estudios');
  });

  it('should correctly identify expanded and pushed-down cards', () => {
    const list: Category[] = [
      { id: 'c1', name: 'C1', colorKey: 'violeta', icon: 'paw-outline', createdAt: '' },
      { id: 'c2', name: 'C2', colorKey: 'turquesa', icon: 'paw-outline', createdAt: '' },
      { id: 'c3', name: 'C3', colorKey: 'azul', icon: 'paw-outline', createdAt: '' },
    ];

    expect(component.isCardExpanded('c2')).toBeFalse();
    expect(component.isCardPushedDown(list, 'c3')).toBeFalse();

    component.onToggleCategory('c2');
    expect(component.isCardExpanded('c2')).toBeTrue();
    expect(component.isCardPushedDown(list, 'c1')).toBeFalse();
    expect(component.isCardPushedDown(list, 'c2')).toBeFalse();
    expect(component.isCardPushedDown(list, 'c3')).toBeTrue();
  });

  it('should navigate to tasks tab with queryParams when goToTasksByCategory is called', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    component.goToTasksByCategory('cat-trabajo');

    expect(router.navigate).toHaveBeenCalledWith(['/tabs/tab1'], {
      queryParams: { categoryId: 'cat-trabajo' },
    });
  });
});
