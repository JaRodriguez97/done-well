import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys.constants';
import { Task } from '../../../core/models/task.model';
import { StorageService } from '../../../core/services/storage.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj<StorageService>('StorageService', [
      'get',
      'set',
      'remove',
    ]);
    storageSpy.get.and.resolveTo(null);
    storageSpy.set.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        TasksService,
        { provide: StorageService, useValue: storageSpy },
      ],
    });

    service = TestBed.inject(TasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load stored tasks and normalize them', async () => {
    const storedTasks: Task[] = [
      {
        id: 'task-1',
        title: '  Revisar entregables  ',
        completed: false,
        categoryId: 'cat-trabajo',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    storageSpy.get.and.resolveTo(storedTasks);

    await service.loadTasks();
    const current = await firstValueFrom(service.tasks$);

    expect(storageSpy.get).toHaveBeenCalledOnceWith(STORAGE_KEYS.TASKS);
    expect(current.length).toBe(1);
    expect(current[0].title).toBe('Revisar entregables');
  });

  it('should initialize with empty array when storage returns null', async () => {
    storageSpy.get.and.resolveTo(null);

    await service.loadTasks();
    const current = await firstValueFrom(service.tasks$);

    expect(current).toEqual([]);
  });

  it('should add a new task at the beginning and persist', async () => {
    const created = await service.addTask('  Preparar demo Android  ');
    const current = await firstValueFrom(service.tasks$);

    expect(created.title).toBe('Preparar demo Android');
    expect(created.completed).toBeFalse();
    expect(current[0]).toEqual(created);
    expect(storageSpy.set).toHaveBeenCalledOnceWith(
      STORAGE_KEYS.TASKS,
      current,
    );
  });

  it('should reject adding a task with an empty title', async () => {
    await expectAsync(service.addTask('   ')).toBeRejectedWithError(
      'El título de la tarea no puede estar vacío.',
    );
    expect(storageSpy.set).not.toHaveBeenCalled();
  });

  it('should toggle completion state of a task and persist', async () => {
    const task = await service.addTask('Configurar Gradle');
    storageSpy.set.calls.reset();

    await service.toggleTask(task.id);
    const current = await firstValueFrom(service.tasks$);

    expect(current[0].completed).toBeTrue();
    expect(storageSpy.set).toHaveBeenCalledOnceWith(
      STORAGE_KEYS.TASKS,
      current,
    );
  });

  it('should delete a task by id and persist', async () => {
    const task = await service.addTask('Tarea temporal');
    storageSpy.set.calls.reset();

    await service.deleteTask(task.id);
    const current = await firstValueFrom(service.tasks$);

    expect(current).toEqual([]);
    expect(storageSpy.set).toHaveBeenCalledOnceWith(STORAGE_KEYS.TASKS, []);
  });
});
