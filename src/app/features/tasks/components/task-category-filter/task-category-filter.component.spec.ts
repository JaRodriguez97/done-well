import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Category } from '../../../../core/models/category.model';
import { Task } from '../../../../core/models/task.model';
import { TaskCategoryFilterComponent } from './task-category-filter.component';

describe('TaskCategoryFilterComponent', () => {
  let component: TaskCategoryFilterComponent;
  let fixture: ComponentFixture<TaskCategoryFilterComponent>;

  const sampleCategories: Category[] = [
    {
      id: 'cat-trabajo',
      name: 'Trabajo',
      colorKey: 'trabajo',
      icon: 'briefcase-outline',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'cat-compras',
      name: 'Compras',
      colorKey: 'compras',
      icon: 'cart-outline',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const sampleTasks: Task[] = [
    {
      id: 't-1',
      title: 'Enviar informe',
      completed: false,
      categoryId: 'cat-trabajo',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 't-2',
      title: 'Revisar código',
      completed: true,
      categoryId: 'cat-trabajo',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 't-3',
      title: 'Llamar a casa',
      completed: false,
      categoryId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCategoryFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCategoryFilterComponent);
    component = fixture.componentInstance;
    component.categories = sampleCategories;
    component.tasks = sampleTasks;
    fixture.detectChanges();
  });

  it('should create and compute counts per filter', () => {
    expect(component).toBeTruthy();
    expect(component.countByFilter('all')).toBe(3);
    expect(component.countByFilter('uncategorized')).toBe(1);
    expect(component.countByFilter('cat-trabajo')).toBe(2);
    expect(component.countByFilter('cat-compras')).toBe(0);
  });

  it('should render category chips with icons and emit filterChanged on DOM click', () => {
    spyOn(component.filterChanged, 'emit');

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('ion-chip.task-filter__chip'),
    ) as HTMLElement[];
    expect(chips.length).toBe(4);

    const trabajoChip = chips[2];
    const trabajoIcon = trabajoChip.querySelector('ion-icon');
    expect((trabajoIcon as HTMLIonIconElement | null)?.name).toBe(
      'briefcase-outline',
    );
    expect(trabajoChip.textContent).toContain('Trabajo');

    trabajoChip.click();
    expect(component.filterChanged.emit).toHaveBeenCalledOnceWith('cat-trabajo');

    chips[1].click();
    expect(component.filterChanged.emit).toHaveBeenCalledWith('uncategorized');
  });
});
