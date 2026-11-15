import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Category } from '../../../../core/models/category.model';
import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  const sampleCategories: Category[] = [
    {
      id: 'cat-compras',
      name: 'Compras',
      colorKey: 'compras',
      icon: 'cart-outline',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
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

  it('should render category chips with icon and color and submit selected category on DOM click', () => {
    spyOn(component.taskSubmitted, 'emit');
    component.categories = sampleCategories;
    fixture.detectChanges();

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('ion-chip.task-form__chip'),
    ) as HTMLElement[];
    expect(chips.length).toBe(2);

    const comprasChip = chips[1];
    const comprasIcon = comprasChip.querySelector('ion-icon');
    expect((comprasIcon as HTMLIonIconElement | null)?.name).toBe('cart-outline');
    expect(comprasChip.textContent).toContain('Compras');

    comprasChip.click();
    component.titleControl.setValue('  Comprar leche  ');

    const submitButton = fixture.nativeElement.querySelector(
      'ion-button.task-form__submit',
    ) as HTMLElement;
    submitButton.click();
    fixture.detectChanges();

    expect(component.validationError).toBeNull();
    expect(component.taskSubmitted.emit).toHaveBeenCalledOnceWith({
      title: 'Comprar leche',
      categoryId: 'cat-compras',
    });
    expect(component.titleControl.value).toBe('');
    expect(component.categoryControl.value).toBeNull();
  });
});
