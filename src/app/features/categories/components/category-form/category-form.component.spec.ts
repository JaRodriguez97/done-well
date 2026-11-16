import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CATEGORY_ICON_OPTIONS } from '../../../../core/constants/category.constants';
import { Category } from '../../../../core/models/category.model';
import { CategoryFormComponent } from './category-form.component';

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create without native form element and render icon chips without visible labels', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();

    const iconChips = Array.from(
      fixture.nativeElement.querySelectorAll('.category-form__icon-chip'),
    ) as HTMLElement[];
    expect(iconChips.length).toBe(6);
    for (const chip of iconChips) {
      expect(chip.querySelector('ion-label')).toBeNull();
      expect(chip.getAttribute('aria-label')).toContain('Ícono');
    }
  });

  it('should show validation error when submitting empty name', () => {
    spyOn(component.categorySaved, 'emit');

    component.nameControl.setValue('   ');
    component.onSubmit();

    expect(component.validationError).toBeTruthy();
    expect(component.categorySaved.emit).not.toHaveBeenCalled();
  });

  it('should select color and icon independently and submit via DOM button click', () => {
    spyOn(component.categorySaved, 'emit');

    component.nameControl.setValue('  Mascotas  ');
    component.selectColor('ambar');
    expect(component.showAllIcons).toBeFalse();
    expect(component.visibleIconOptions.length).toBe(6);

    component.toggleShowAllIcons();
    expect(component.showAllIcons).toBeTrue();
    expect(component.visibleIconOptions.length).toBe(
      CATEGORY_ICON_OPTIONS.length,
    );

    component.selectIcon('paw-outline');

    const submitButton = fixture.nativeElement.querySelector(
      'ion-button.category-form__submit',
    ) as HTMLElement;
    submitButton.click();
    fixture.detectChanges();

    expect(component.validationError).toBeNull();
    expect(component.categorySaved.emit).toHaveBeenCalledOnceWith({
      name: 'Mascotas',
      colorKey: 'ambar',
      icon: 'paw-outline',
    });
    expect(component.nameControl.value).toBe('');
    expect(component.showAllIcons).toBeFalse();
  });

  it('should populate color and icon in edit mode and emit cancel when requested', () => {
    spyOn(component.editCancelled, 'emit');
    const target: Category = {
      id: 'cat-1',
      name: 'Veterinaria',
      colorKey: 'azul',
      icon: 'paw-outline',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    component.editingCategory = target;
    expect(component.isEditMode).toBeTrue();
    expect(component.nameControl.value).toBe('Veterinaria');
    expect(component.selectedColorKey).toBe('azul');
    expect(component.selectedIcon).toBe('paw-outline');
    expect(
      component.visibleIconOptions.some(
        (option) => option.name === 'paw-outline',
      ),
    ).toBeTrue();

    component.onCancelEdit();
    expect(component.editCancelled.emit).toHaveBeenCalledTimes(1);
    expect(component.nameControl.value).toBe('');
  });
});
