import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation error when submitting empty title', () => {
    spyOn(component.taskSubmitted, 'emit');

    component.titleControl.setValue('   ');
    component.onSubmit();

    expect(component.validationError).toBeTruthy();
    expect(component.taskSubmitted.emit).not.toHaveBeenCalled();
  });

  it('should emit trimmed title and reset input on valid submit', () => {
    spyOn(component.taskSubmitted, 'emit');

    component.titleControl.setValue('  Comprar leche  ');
    component.onSubmit();

    expect(component.validationError).toBeNull();
    expect(component.taskSubmitted.emit).toHaveBeenCalledOnceWith(
      'Comprar leche',
    );
    expect(component.titleControl.value).toBe('');
  });
});
