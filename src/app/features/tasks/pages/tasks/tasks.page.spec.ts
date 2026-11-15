import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertButton, AlertController } from '@ionic/angular/standalone';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { Task } from '../../../../core/models/task.model';
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

  const sampleCategory: Category = {
    id: 'cat-trabajo',
    name: 'Trabajo',
    colorKey: 'trabajo',
    icon: 'briefcase-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const sampleTask: Task = {
    id: 'task-1',
    title: 'Enviar reporte',
    completed: false,
    categoryId: 'cat-trabajo',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    tasksSubject = new BehaviorSubject<Task[]>([]);
    categoriesSubject = new BehaviorSubject<Category[]>([sampleCategory]);

    tasksServiceSpy = jasmine.createSpyObj<TasksService>(
      'TasksService',
      ['loadTasks', 'addTask', 'toggleTask', 'deleteTask'],
      { tasks$: tasksSubject.asObservable() },
    );
    tasksServiceSpy.loadTasks.and.resolveTo();
    tasksServiceSpy.addTask.and.resolveTo(sampleTask);
    tasksServiceSpy.toggleTask.and.resolveTo();
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

  it('should delegate task creation with categoryId to TasksService', async () => {
    await component.onCreateTask({
      title: 'Enviar reporte',
      categoryId: 'cat-trabajo',
    });

    expect(tasksServiceSpy.addTask).toHaveBeenCalledOnceWith(
      'Enviar reporte',
      'cat-trabajo',
    );
    expect(component.errorMessage).toBeNull();
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
});
