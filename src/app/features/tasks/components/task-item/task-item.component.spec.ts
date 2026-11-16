import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockCategory, createMockTask } from '../../../../core/testing/test-fixtures';
import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;

  const sampleCategory = createMockCategory({
    id: 'cat-trabajo',
    name: 'Trabajo',
    colorKey: 'violeta',
    icon: 'briefcase-outline',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    component.task = createMockTask({
      id: 'task-10',
      title: 'Revisar código',
      completed: false,
      categoryId: 'cat-trabajo',
      priority: 'high',
      status: 'pending',
      description: 'Validar servicios',
      subtasks: [
        { id: 'sub-1', title: 'Correr lint', completed: true },
        { id: 'sub-2', title: 'Correr tests', completed: false },
      ],
      startDate: '2026-11-16',
      dueDate: '2026-11-20',
    });
    component.category = sampleCategory;
    fixture.detectChanges();
  });

  it('should create and compute category border class', () => {
    expect(component).toBeTruthy();
    expect(component.borderClass).toBe('dw-border-violeta');
    expect(component.priorityOption.label).toBe('Alta');
    expect(component.completedSubtasksCount).toBe(1);
    expect(component.totalSubtasksCount).toBe(2);
  });

  it('should fallback border class to pizarra when category is null', () => {
    component.category = null;
    expect(component.borderClass).toBe('dw-border-pizarra');
  });

  it('should emit task id when toggled', () => {
    spyOn(component.toggleRequested, 'emit');

    component.onToggle();

    expect(component.toggleRequested.emit).toHaveBeenCalledOnceWith('task-10');
  });

  it('should cycle task status when clicking status chip', () => {
    spyOn(component.statusChanged, 'emit');

    const statusChip = fixture.nativeElement.querySelector(
      '.task-item__status-chip',
    ) as HTMLElement;
    statusChip.click();

    expect(component.statusChanged.emit).toHaveBeenCalledOnceWith({
      taskId: 'task-10',
      status: 'in_progress',
    });
  });

  it('should emit subtaskToggled when toggling a microtask', () => {
    spyOn(component.subtaskToggled, 'emit');

    component.onSubtaskToggle('sub-2');

    expect(component.subtaskToggled.emit).toHaveBeenCalledOnceWith({
      taskId: 'task-10',
      subtaskId: 'sub-2',
    });
  });

  it('should emit task object when edit is requested', () => {
    spyOn(component.editRequested, 'emit');

    component.onEdit();

    expect(component.editRequested.emit).toHaveBeenCalledOnceWith(
      component.task,
    );
  });

  it('should toggle expanded state and reveal details', () => {
    expect(component.isExpanded).toBeFalse();
    expect(
      fixture.nativeElement.querySelector('.task-item__details'),
    ).toBeNull();

    component.toggleExpanded();
    fixture.detectChanges();

    expect(component.isExpanded).toBeTrue();
    expect(
      fixture.nativeElement.querySelector('.task-item__details'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.task-item__dates-row'),
    ).not.toBeNull();
  });

  it('should emit task object when delete is requested', () => {
    spyOn(component.deleteRequested, 'emit');

    component.onDelete();

    expect(component.deleteRequested.emit).toHaveBeenCalledOnceWith(
      component.task,
    );
  });
});
