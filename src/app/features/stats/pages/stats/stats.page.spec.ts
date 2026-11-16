import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../../../../core/models/category.model';
import { Task } from '../../../../core/models/task.model';
import { RemoteConfigService } from '../../../../core/services/remote-config.service';
import { CategoriesService } from '../../../categories/services/categories.service';
import { TasksService } from '../../../tasks/services/tasks.service';
import { StatsPage } from './stats.page';

describe('StatsPage', () => {
  let component: StatsPage;
  let fixture: ComponentFixture<StatsPage>;
  let tasksSubject: BehaviorSubject<Task[]>;
  let categoriesSubject: BehaviorSubject<Category[]>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let categoriesServiceSpy: jasmine.SpyObj<CategoriesService>;
  let remoteConfigServiceSpy: jasmine.SpyObj<RemoteConfigService>;

  const sampleCategory: Category = {
    id: 'cat-trabajo',
    name: 'Trabajo',
    colorKey: 'trabajo',
    icon: 'briefcase-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const sampleTasks: Task[] = [
    {
      id: 't-1',
      title: 'Subir commit aplicacion',
      completed: true,
      categoryId: 'cat-trabajo',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 't-2',
      title: 'Generar APK',
      completed: false,
      categoryId: 'cat-trabajo',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 't-3',
      title: 'Tomar captura',
      completed: true,
      categoryId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    tasksSubject = new BehaviorSubject<Task[]>(sampleTasks);
    categoriesSubject = new BehaviorSubject<Category[]>([sampleCategory]);

    tasksServiceSpy = jasmine.createSpyObj<TasksService>(
      'TasksService',
      ['loadTasks'],
      { tasks$: tasksSubject.asObservable() },
    );
    tasksServiceSpy.loadTasks.and.resolveTo();

    categoriesServiceSpy = jasmine.createSpyObj<CategoriesService>(
      'CategoriesService',
      ['loadCategories'],
      { categories$: categoriesSubject.asObservable() },
    );
    categoriesServiceSpy.loadCategories.and.resolveTo();

    remoteConfigServiceSpy = jasmine.createSpyObj<RemoteConfigService>(
      'RemoteConfigService',
      ['syncFlags'],
    );
    remoteConfigServiceSpy.syncFlags.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [StatsPage],
      providers: [
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: RemoteConfigService, useValue: remoteConfigServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load tasks and categories on init', () => {
    expect(component).toBeTruthy();
    expect(tasksServiceSpy.loadTasks).toHaveBeenCalledTimes(1);
    expect(categoriesServiceSpy.loadCategories).toHaveBeenCalledTimes(1);
  });

  it('should compute overall and per-category completion metrics including uncategorized tasks', () => {
    const tasksWithDetails: Task[] = [
      {
        id: 't-1',
        title: 'T1',
        completed: true,
        status: 'completed',
        priority: 'high',
        categoryId: 'cat-trabajo',
        subtasks: [{ id: 's1', title: 'Sub1', completed: true }],
        dueDate: '2025-01-01',
        createdAt: '2025-01-01',
      },
      {
        id: 't-2',
        title: 'T2',
        completed: false,
        status: 'in_progress',
        priority: 'medium',
        categoryId: 'cat-trabajo',
        subtasks: [{ id: 's2', title: 'Sub2', completed: false }],
        dueDate: '2099-12-31',
        createdAt: '2025-01-01',
      },
      {
        id: 't-3',
        title: 'T3',
        completed: false,
        status: 'pending',
        priority: 'low',
        categoryId: null,
        createdAt: '2025-01-01',
      },
    ];

    const overview = component.buildStatsOverview(tasksWithDetails, [
      sampleCategory,
    ]);

    expect(overview.totalTasks).toBe(3);
    expect(overview.completedTasks).toBe(1);
    expect(overview.pendingTasks).toBe(2);
    expect(overview.completionPercent).toBe(33);

    // Categories
    expect(overview.categoryStats.length).toBe(2);
    expect(overview.categoryStats[0].id).toBe('cat-trabajo');
    expect(overview.categoryStats[1].id).toBe('uncategorized');

    // Priority
    expect(overview.priorityStats.length).toBe(3);
    const highPriority = overview.priorityStats.find((p) => p.priority === 'high');
    expect(highPriority?.total).toBe(1);
    expect(highPriority?.completed).toBe(1);

    // Status distribution
    expect(overview.statusDistribution.completed).toBe(1);
    expect(overview.statusDistribution.inProgress).toBe(1);
    expect(overview.statusDistribution.pending).toBe(1);

    // Subtasks telemetry
    expect(overview.subtasksTelemetry.total).toBe(2);
    expect(overview.subtasksTelemetry.completed).toBe(1);
    expect(overview.subtasksTelemetry.completionPercent).toBe(50);

    // Due date telemetry
    expect(overview.dueDateTelemetry.withDueDate).toBe(2);
    expect(overview.dueDateTelemetry.noDueDate).toBe(1);
  });

  it('should trigger RemoteConfigService syncFlags when refreshing manually', async () => {
    await component.onRefreshRemoteConfig();

    expect(remoteConfigServiceSpy.syncFlags).toHaveBeenCalledTimes(1);
    expect(component.isSyncing).toBeFalse();
  });
});
