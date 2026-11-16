import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Category } from '../../../../core/models/category.model';
import { createMockCategory } from '../../../../core/testing/test-fixtures';
import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  const sampleCategories: Category[] = [
    createMockCategory({
      id: 'cat-compras',
      name: 'Compras',
      colorKey: 'ambar',
      icon: 'cart-outline',
    }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create without native form element', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should show validation error when submitting empty title', () => {
    spyOn(component.taskSubmitted, 'emit');

    component.titleControl.setValue('   ');
    component.onSubmit();

    expect(component.validationError).toBeTruthy();
    expect(component.taskSubmitted.emit).not.toHaveBeenCalled();
  });

  it('should reject submitting when dueDate is earlier than startDate', () => {
    spyOn(component.taskSubmitted, 'emit');

    component.titleControl.setValue('Entregar prueba');
    component.startDateControl.setValue('2026-11-20');
    component.dueDateControl.setValue('2026-11-16');
    component.onSubmit();

    expect(component.validationError).toBe(
      'La fecha límite no puede ser anterior a la fecha inicial.',
    );
    expect(component.taskSubmitted.emit).not.toHaveBeenCalled();
  });

  it('should render category chips with icon and color and submit task payload on DOM click', () => {
    spyOn(component.taskSubmitted, 'emit');
    component.categories = sampleCategories;
    fixture.detectChanges();

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('ion-chip.task-form__chip'),
    ) as HTMLElement[];
    expect(chips.length).toBe(2);

    const comprasChip = chips[1];
    const comprasIcon = comprasChip.querySelector('ion-icon');
    expect((comprasIcon as HTMLIonIconElement | null)?.name).toBe(
      'cart-outline',
    );
    expect(comprasChip.textContent).toContain('Compras');

    comprasChip.click();
    component.selectPriority('high');
    component.selectStatus('in_progress');
    component.titleControl.setValue('  Comprar leche  ');
    component.descriptionControl.setValue('  Deslactosada  ');
    component.startDateControl.setValue('2026-11-16');
    component.dueDateControl.setValue('2026-11-18');
    component.subtaskInputControl.setValue('Revisar fecha');
    component.addSubtask();

    expect(component.subtasks.length).toBe(1);
    const addedSubtask = component.subtasks[0];

    const submitButton = fixture.nativeElement.querySelector(
      'ion-button.task-form__submit',
    ) as HTMLElement;
    submitButton.click();
    fixture.detectChanges();

    expect(component.validationError).toBeNull();
    expect(component.taskSubmitted.emit).toHaveBeenCalledOnceWith({
      title: 'Comprar leche',
      categoryId: 'cat-compras',
      priority: 'high',
      status: 'in_progress',
      description: 'Deslactosada',
      subtasks: [addedSubtask],
      startDate: '2026-11-16',
      dueDate: '2026-11-18',
    });
    expect(component.titleControl.value).toBe('');
    expect(component.descriptionControl.value).toBe('');
    expect(component.categoryControl.value).toBeNull();
    expect(component.priorityControl.value).toBe('medium');
    expect(component.statusControl.value).toBe('pending');
    expect(component.subtasks.length).toBe(0);
  });

  it('should allow adding and removing subtasks before submit', () => {
    component.subtaskInputControl.setValue('Paso 1');
    component.addSubtask();
    expect(component.subtasks.length).toBe(1);
    expect(component.subtaskInputControl.value).toBe('');

    const id = component.subtasks[0].id;
    component.removeSubtask(id);
    expect(component.subtasks.length).toBe(0);
  });

  it('should populate form when initialTask is provided and reflect edit mode with defensive copy', () => {
    const rawTask = {
      id: 'task-100',
      title: 'Tarea para editar',
      completed: false,
      categoryId: 'cat-compras',
      priority: 'high' as const,
      status: 'in_progress' as const,
      description: 'Nota existente',
      subtasks: [{ id: 's-1', title: 'Sub 1', completed: true }],
      startDate: '2026-11-10',
      dueDate: '2026-11-25',
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    component.initialTask = rawTask;
    rawTask.title = 'Mutado externamente';
    fixture.detectChanges();

    expect(component.isEditMode).toBeTrue();
    expect(component.titleControl.value).toBe('Tarea para editar');
    expect(component.initialTask?.title).toBe('Tarea para editar');
    expect(component.categoryControl.value).toBe('cat-compras');
    expect(component.priorityControl.value).toBe('high');
    expect(component.statusControl.value).toBe('in_progress');
    expect(component.descriptionControl.value).toBe('Nota existente');
    expect(component.startDateControl.value).toBe('2026-11-10');
    expect(component.dueDateControl.value).toBe('2026-11-25');
    expect(component.subtasks.length).toBe(1);

    const submitButton = fixture.nativeElement.querySelector(
      'ion-button.task-form__submit',
    ) as HTMLElement;
    expect(submitButton.textContent).toContain('Guardar cambios');
  });
});
