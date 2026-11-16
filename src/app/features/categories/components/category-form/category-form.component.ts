import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  chevronUpOutline,
  closeCircleOutline,
  ellipse,
} from 'ionicons/icons';
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
  CATEGORY_ICON_REGISTRY,
  CategoryIconOption,
  DEFAULT_CATEGORY_ICON,
} from '../../../../core/constants/category.constants';
import {
  Category,
  CategoryColorKey,
  CategoryPayload,
} from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonList,
    IonChip,
    IonLabel,
    IonButton,
    IonIcon,
    IonText,
  ],
})
export class CategoryFormComponent {
  private _editingCategory: Category | null = null;
  private _disabled = false;

  readonly colorOptions = CATEGORY_COLOR_OPTIONS;
  readonly iconOptions = CATEGORY_ICON_OPTIONS;
  readonly nameControl = new FormControl('', { nonNullable: true });
  selectedColorKey: CategoryColorKey = 'violeta';
  selectedIcon: string = DEFAULT_CATEGORY_ICON;
  showAllIcons = false;
  validationError: string | null = null;

  @Input()
  get editingCategory(): Category | null {
    return this._editingCategory;
  }

  set editingCategory(category: Category | null) {
    this._editingCategory = category;
    this.validationError = null;
    this.showAllIcons = false;
    if (category) {
      this.nameControl.setValue(category.name);
      this.selectedColorKey = category.colorKey;
      this.selectedIcon = category.icon;
      return;
    }
    this.nameControl.setValue('');
    this.selectedColorKey = 'violeta';
    this.selectedIcon = DEFAULT_CATEGORY_ICON;
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
    if (value) {
      this.nameControl.disable({ emitEvent: false });
    } else {
      this.nameControl.enable({ emitEvent: false });
    }
  }

  @Output() readonly categorySaved = new EventEmitter<CategoryPayload>();
  @Output() readonly editCancelled = new EventEmitter<void>();

  constructor() {
    addIcons({
      ...CATEGORY_ICON_REGISTRY,
      addCircleOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      alertCircleOutline,
      ellipse,
      chevronDownOutline,
      chevronUpOutline,
    });
  }

  get isEditMode(): boolean {
    return this._editingCategory !== null;
  }

  get visibleIconOptions(): readonly CategoryIconOption[] {
    if (this.showAllIcons) {
      return this.iconOptions;
    }
    const featured = this.iconOptions.filter((option) => option.featured);
    const hasSelected = featured.some(
      (option) => option.name === this.selectedIcon,
    );
    if (hasSelected) {
      return featured;
    }
    const selectedOption = this.iconOptions.find(
      (option) => option.name === this.selectedIcon,
    );
    return selectedOption ? [selectedOption, ...featured] : featured;
  }

  /**
   * Selecciona el color de acento de forma independiente al ícono.
   */
  selectColor(colorKey: CategoryColorKey): void {
    if (!this._disabled) {
      this.selectedColorKey = colorKey;
    }
  }

  /**
   * Selecciona el ícono de la categoría de forma independiente al color.
   */
  selectIcon(iconName: string): void {
    if (!this._disabled) {
      this.selectedIcon = iconName;
    }
  }

  /**
   * Alterna la visualización completa del catálogo de íconos.
   */
  toggleShowAllIcons(): void {
    if (!this._disabled) {
      this.showAllIcons = !this.showAllIcons;
    }
  }

  /**
   * Valida el nombre de la categoría y emite los datos al componente padre.
   */
  onSubmit(): void {
    if (this._disabled) {
      return;
    }

    const trimmedName = this.nameControl.value.trim();
    if (!trimmedName) {
      this.validationError = 'Escribe un nombre para la categoría.';
      return;
    }

    this.validationError = null;
    this.categorySaved.emit({
      name: trimmedName,
      colorKey: this.selectedColorKey,
      icon: this.selectedIcon,
    });

    if (!this.isEditMode) {
      this.nameControl.setValue('');
      this.selectedColorKey = 'violeta';
      this.selectedIcon = DEFAULT_CATEGORY_ICON;
      this.showAllIcons = false;
    }
  }

  onCancelEdit(): void {
    this.validationError = null;
    this.nameControl.setValue('');
    this.selectedColorKey = 'violeta';
    this.selectedIcon = DEFAULT_CATEGORY_ICON;
    this.showAllIcons = false;
    this.editCancelled.emit();
  }

  clearValidationError(): void {
    if (this.validationError) {
      this.validationError = null;
    }
  }
}
