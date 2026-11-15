import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../../../core/models/task.model';
import { TasksService } from '../../services/tasks.service';
import { TasksPage } from './tasks.page';

describe('TasksPage', () => {
  let component: TasksPage;
  let fixture: ComponentFixture<TasksPage>;
  let tasksSubject: BehaviorSubject<Task[]>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;

  beforeEach(async () => {
    tasksSubject = new BehaviorSubject<Task[]>([]);
    tasksServiceSpy = jasmine.createSpyObj<TasksService>(
      'TasksService',
      ['loadTasks', 'addTask', 'toggleTask', 'deleteTask'],
      { tasks$: tasksSubject.asObservable() }
    );
    tasksServiceSpy.loadTasks.and.resolveTo();
    tasksServiceSpy.addTask.and.resolveTo({
      id: 'task-1',
      title: 'Nueva tarea',
      completed: false,
      categoryId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
    });
    tasksServiceSpy.toggleTask.and.resolveTo();
    tasksServiceSpy.deleteTask.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [{ provide: TasksService, useValue: tasksServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load tasks on init', () => {
    expect(component).toBeTruthy();
    expect(tasksServiceSpy.loadTasks).toHaveBeenCalledTimes(1);
  });

  it('should delegate task creation to TasksService', async () => {
    await component.onCreateTask('Enviar reporte');

    expect(tasksServiceSpy.addTask).toHaveBeenCalledOnceWith('Enviar reporte');
    expect(component.errorMessage).toBeNull();
  });

  it('should delegate task toggle and deletion to TasksService', async () => {
    await component.onToggleTask('task-1');
    await component.onDeleteTask('task-1');

    expect(tasksServiceSpy.toggleTask).toHaveBeenCalledOnceWith('task-1');
    expect(tasksServiceSpy.deleteTask).toHaveBeenCalledOnceWith('task-1');
  });
});
