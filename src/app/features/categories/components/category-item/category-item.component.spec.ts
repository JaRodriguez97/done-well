import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryItemComponent } from './category-item.component';

describe('CategoryItemComponent', () => {
  let component: CategoryItemComponent;
  let fixture: ComponentFixture<CategoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryItemComponent);
    component = fixture.componentInstance;
    component.category = {
      id: 'cat-trabajo',
      name: 'Trabajo',
      colorKey: 'trabajo',
      icon: 'briefcase-outline',
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    component.taskCount = 3;
    fixture.detectChanges();
  });

  it('should create and compute border class', () => {
    expect(component).toBeTruthy();
    expect(component.borderClass).toBe('dw-border-trabajo');
  });

  it('should emit category when edit is requested', () => {
    spyOn(component.editRequested, 'emit');

    component.onEdit();

    expect(component.editRequested.emit).toHaveBeenCalledOnceWith(
      component.category,
    );
  });

  it('should emit category when delete is requested', () => {
    spyOn(component.deleteRequested, 'emit');

    component.onDelete();

    expect(component.deleteRequested.emit).toHaveBeenCalledOnceWith(
      component.category,
    );
  });
});
