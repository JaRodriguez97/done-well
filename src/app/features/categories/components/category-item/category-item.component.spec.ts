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

  it('should create and compute border and glass class', () => {
    expect(component).toBeTruthy();
    expect(component.borderClass).toBe('dw-border-trabajo');
    expect(component.glassClass).toBe('category-card--trabajo');
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

  it('should emit toggleRequested when card is clicked', () => {
    spyOn(component.toggleRequested, 'emit');

    component.onCardClick();

    expect(component.toggleRequested.emit).toHaveBeenCalledTimes(1);
  });

  it('should prevent propagation when onEdit and onDelete are called with an event', () => {
    const editEvent = new MouseEvent('click');
    spyOn(editEvent, 'stopPropagation');
    spyOn(component.editRequested, 'emit');

    component.onEdit(editEvent);

    expect(editEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(component.editRequested.emit).toHaveBeenCalledWith(
      component.category,
    );

    const deleteEvent = new MouseEvent('click');
    spyOn(deleteEvent, 'stopPropagation');
    spyOn(component.deleteRequested, 'emit');

    component.onDelete(deleteEvent);

    expect(deleteEvent.stopPropagation).toHaveBeenCalledTimes(1);
    expect(component.deleteRequested.emit).toHaveBeenCalledWith(
      component.category,
    );
  });

  it('should accept completedTaskCount and render the badge', () => {
    component.completedTaskCount = 4;
    fixture.detectChanges();
    expect(component.completedTaskCount).toBe(4);

    const badgeElement: HTMLElement | null =
      fixture.nativeElement.querySelector('.category-card__badge');
    expect(badgeElement).not.toBeNull();
    expect(badgeElement?.textContent).toContain('4 completadas');
  });

  it('should emit viewTasksRequested when onViewTasks is called', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    spyOn(component.viewTasksRequested, 'emit');

    component.onViewTasks(event);

    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(component.viewTasksRequested.emit).toHaveBeenCalledOnceWith(
      component.category,
    );
  });

  it('should apply category-card--last-collapsed when isLast is true and isExpanded is false', () => {
    component.isLast = true;
    component.isExpanded = false;
    fixture.detectChanges();

    const card: HTMLElement | null = fixture.nativeElement.querySelector('.category-card');
    expect(card?.classList.contains('category-card--last-collapsed')).toBeTrue();

    component.isExpanded = true;
    fixture.detectChanges();
    expect(card?.classList.contains('category-card--last-collapsed')).toBeFalse();
  });
});
