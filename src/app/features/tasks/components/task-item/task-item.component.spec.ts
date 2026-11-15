import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    component.task = {
      id: 'task-10',
      title: 'Revisar código',
      completed: false,
      categoryId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit task id when toggled', () => {
    spyOn(component.toggleRequested, 'emit');

    component.onToggle();

    expect(component.toggleRequested.emit).toHaveBeenCalledOnceWith('task-10');
  });

  it('should emit task id when delete is requested', () => {
    spyOn(component.deleteRequested, 'emit');

    component.onDelete();

    expect(component.deleteRequested.emit).toHaveBeenCalledOnceWith('task-10');
  });
});
