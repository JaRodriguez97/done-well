import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Category } from '../../../../core/models/category.model';
import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;

  const sampleCategory: Category = {
    id: 'cat-trabajo',
    name: 'Trabajo',
    colorKey: 'trabajo',
    icon: 'briefcase-outline',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

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
      categoryId: 'cat-trabajo',
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    component.category = sampleCategory;
    fixture.detectChanges();
  });

  it('should create and compute category border class', () => {
    expect(component).toBeTruthy();
    expect(component.borderClass).toBe('dw-border-trabajo');
  });

  it('should fallback border class to otros when category is null', () => {
    component.category = null;
    expect(component.borderClass).toBe('dw-border-otros');
  });

  it('should emit task id when toggled', () => {
    spyOn(component.toggleRequested, 'emit');

    component.onToggle();

    expect(component.toggleRequested.emit).toHaveBeenCalledOnceWith('task-10');
  });

  it('should emit task object when delete is requested', () => {
    spyOn(component.deleteRequested, 'emit');

    component.onDelete();

    expect(component.deleteRequested.emit).toHaveBeenCalledOnceWith(
      component.task,
    );
  });
});
