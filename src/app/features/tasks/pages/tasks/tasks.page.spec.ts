import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlertButton, AlertController } from '@ionic/angular/standalone';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { Task } from '../../../../core/models/task.model';
import { createMockCategory, createMockTask } from '../../../../core/testing/test-fixtures';
import { CategoriesService } from '../../../categories/services/categories.service';
import { TasksService } from '../../services/tasks.service';
import { TasksPage } from './tasks.page';

describe('TasksPage', () => {
  let component: TasksPage;
  let fixture: ComponentFixture<TasksPage>;
  let tasksSubject: BehaviorSubject<Task[]>;
  let categoriesSubject: BehaviorSubject<Category[]>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let categoriesServiceSpy: jasmine.SpyObj<CategoriesService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let alertElementSpy: jasmine.SpyObj<HTMLIonAlertElement>;

  const sampleCategory: Category = createMockCategory({
    id: 'cat-trabajo',
    name: 'Trabajo',
    colorKey: 'violeta',
    icon: 'briefcase-outline',
  });

  const sampleTask: Task = createMockTask({
    id: 'task-1',
    title: 'Enviar reporte',
    completed: false,
    categoryId: 'cat-trabajo',
  });

  beforeEach(async () => {
    tasksSubject = new BehaviorSubject<Task[]>([]);
    categoriesSubject = new BehaviorSubject<Category[]>([sampleCategory]);

    tasksServiceSpy = jasmine.createSpyObj<TasksService>(
      'TasksService',
      [
        'loadTasks',
        'addTask',
        'updateTask',
        'toggleTask',
        'updateTaskStatus',
        'toggleSubtask',
        'deleteTask',
      ],
      { tasks$: tasksSubject.asObservable() },
    );
    tasksServiceSpy.loadTasks.and.resolveTo();
    tasksServiceSpy.addTask.and.resolveTo(sampleTask);
    tasksServiceSpy.updateTask.and.resolveTo();
    tasksServiceSpy.toggleTask.and.resolveTo();
    tasksServiceSpy.updateTaskStatus.and.resolveTo();
    tasksServiceSpy.toggleSubtask.and.resolveTo();
    tasksServiceSpy.deleteTask.and.resolveTo();

    categoriesServiceSpy = jasmine.createSpyObj<CategoriesService>(
      'CategoriesService',
      ['loadCategories'],
      { categories$: categoriesSubject.asObservable() },
    );
    categoriesServiceSpy.loadCategories.and.resolveTo();

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
      imports: [TasksPage],
      providers: [
        provideRouter([]),
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load tasks and categories on init', () => {
    expect(component).toBeTruthy();
    expect(tasksServiceSpy.loadTasks).toHaveBeenCalledTimes(1);
    expect(categoriesServiceSpy.loadCategories).toHaveBeenCalledTimes(1);
  });

  it('should open and close create task modal cleanly', () => {
    expect(component.isCreateModalOpen).toBeFalse();

    component.errorMessage = 'Error previo';
    component.openCreateTaskModal();
    expect(component.isCreateModalOpen).toBeTrue();
    expect(component.errorMessage).toBeNull();

    component.closeCreateTaskModal();
    expect(component.isCreateModalOpen).toBeFalse();
  });

  it('should delegate task creation with categoryId to TasksService and close modal', async () => {
    component.openCreateTaskModal();
    await component.onCreateTask({
      title: 'Enviar reporte',
      categoryId: 'cat-trabajo',
    });

    expect(tasksServiceSpy.addTask).toHaveBeenCalledOnceWith(
      'Enviar reporte',
      'cat-trabajo',
    );
    expect(component.errorMessage).toBeNull();
    expect(component.isCreateModalOpen).toBeFalse();
  });

  it('should keep create modal open and expose errorMessage when task creation fails', async () => {
    tasksServiceSpy.addTask.and.rejectWith(
      new Error('El título de la tarea no puede estar vacío.'),
    );

    component.openCreateTaskModal();
    await component.onCreateTask({
      title: '',
      categoryId: null,
    });

    expect(component.isCreateModalOpen).toBeTrue();
    expect(component.errorMessage).toBe(
      'El título de la tarea no puede estar vacío.',
    );
  });

  it('should confirm deletion via AlertController before deleting a task', async () => {
    await component.confirmDeleteTask(sampleTask);

    expect(alertControllerSpy.create).toHaveBeenCalledTimes(1);
    expect(alertElementSpy.present).toHaveBeenCalledTimes(1);

    const options = alertControllerSpy.create.calls.mostRecent().args[0];
    const buttons = (options?.buttons ?? []) as AlertButton[];
    const confirmButton = buttons.find((btn) => btn.text === 'Eliminar');

    await confirmButton?.handler?.(undefined);
    expect(tasksServiceSpy.deleteTask).toHaveBeenCalledOnceWith('task-1');
  });

  it('should delegate task toggle and find matching category', async () => {
    await component.onToggleTask('task-1');

    expect(tasksServiceSpy.toggleTask).toHaveBeenCalledOnceWith('task-1');
    expect(component.findCategory([sampleCategory], 'cat-trabajo')).toEqual(
      sampleCategory,
    );
    expect(component.findCategory([sampleCategory], null)).toBeNull();
  });

  it('should delegate task status change and subtask toggle to TasksService', async () => {
    await component.onStatusChange({
      taskId: 'task-1',
      status: 'in_progress',
    });
    await component.onSubtaskToggle({
      taskId: 'task-1',
      subtaskId: 'sub-1',
    });

    expect(tasksServiceSpy.updateTaskStatus).toHaveBeenCalledOnceWith(
      'task-1',
      'in_progress',
    );
    expect(tasksServiceSpy.toggleSubtask).toHaveBeenCalledOnceWith(
      'task-1',
      'sub-1',
    );
  });

  it('should filter tasks by all, uncategorized, or specific category and fallback when category is removed', () => {
    const uncategorizedTask: Task = {
      id: 'task-2',
      title: 'Comprar café',
      completed: false,
      categoryId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    const tasks = [sampleTask, uncategorizedTask];

    expect(component.filterTasks(tasks, [sampleCategory])).toEqual(tasks);

    component.onFilterChange('uncategorized');
    expect(component.filterTasks(tasks, [sampleCategory])).toEqual([
      uncategorizedTask,
    ]);

    component.onFilterChange('cat-trabajo');
    expect(component.filterTasks(tasks, [sampleCategory])).toEqual([
      sampleTask,
    ]);

    expect(component.resolveActiveFilter([])).toBe('all');
    expect(component.filterTasks(tasks, [])).toEqual(tasks);
  });

  it('should open edit modal with selected task and update task on save', async () => {
    component.openEditTaskModal(sampleTask);

    expect(component.isCreateModalOpen).toBeTrue();
    expect(component.taskToEdit).toEqual(sampleTask);

    await component.onSaveTask({
      title: 'Título actualizado',
      categoryId: 'cat-trabajo',
      priority: 'high',
      status: 'in_progress',
    });

    expect(tasksServiceSpy.updateTask).toHaveBeenCalledOnceWith('task-1', {
      title: 'Título actualizado',
      categoryId: 'cat-trabajo',
      priority: 'high',
      status: 'in_progress',
    });
    expect(component.isCreateModalOpen).toBeFalse();
    expect(component.taskToEdit).toBeNull();
  });

  it('should filter tasks by search query matching title, description or subtask and clear search', () => {
    const taskWithDesc: Task = {
      id: 'task-desc',
      title: 'Organizar bodega',
      description: 'Buscar cajas plásticas',
      completed: false,
      categoryId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    const taskWithSubtask: Task = {
      id: 'task-sub',
      title: 'Hacer mercado',
      completed: false,
      categoryId: null,
      subtasks: [{ id: 's-1', title: 'Comprar manzanas verdes', completed: false }],
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    const all = [sampleTask, taskWithDesc, taskWithSubtask];

    // Búsqueda por título
    component.searchQuery = 'reporte';
    expect(component.filterTasks(all, [sampleCategory])).toEqual([sampleTask]);

    // Búsqueda por descripción
    component.searchQuery = 'cajas plásticas';
    expect(component.filterTasks(all, [sampleCategory])).toEqual([taskWithDesc]);

    // Búsqueda por subtarea
    component.searchQuery = 'manzanas';
    expect(component.filterTasks(all, [sampleCategory])).toEqual([taskWithSubtask]);

    // Limpiar búsqueda
    component.clearSearch();
    expect(component.searchQuery).toBe('');
    expect(component.filterTasks(all, [sampleCategory])).toEqual(all);
  });

  it('should update selectedFilter on ionViewWillEnter if queryParam exists', () => {
    expect(component.selectedFilter).toBe('all');
    component.ionViewWillEnter();
    expect(component.selectedFilter).toBe('all');
  });
});
