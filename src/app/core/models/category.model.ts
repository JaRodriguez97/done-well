import { BaseEntity, IdentifiableEntity } from './base-entity.model';
import { validateRequiredText } from '../utils/entity.utils';

export type CategoryColorKey =
  | 'violeta'
  | 'turquesa'
  | 'azul'
  | 'ambar'
  | 'coral'
  | 'pizarra'
  | 'esmeralda'
  | 'rosa'
  | 'indigo'
  | 'celeste'
  | 'fucsia'
  | 'lavanda';

export interface CategoryPayload {
  name: string;
  colorKey: CategoryColorKey;
  icon?: string;
}

export interface Category extends IdentifiableEntity, CategoryPayload {
  icon: string;
}

export interface CategoryWithStats extends Category {
  readonly taskCount: number;
  readonly completedTaskCount: number;
}

export interface CreateCategoryParams extends Partial<Category> {
  name: string;
}

export class CategoryItem extends BaseEntity<Category> implements Category {
  private static readonly EMPTY_NAME_ERROR = 'El nombre de la categoría no puede estar vacío.';

  private _name: string;
  colorKey: CategoryColorKey;
  icon: string;

  constructor(params: CreateCategoryParams) {
    super(params.id, params.createdAt);
    this._name = validateRequiredText(params.name, CategoryItem.EMPTY_NAME_ERROR);
    this.colorKey = params.colorKey ?? 'pizarra';
    this.icon = params.icon ?? 'pricetag-outline';
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = validateRequiredText(value, CategoryItem.EMPTY_NAME_ERROR);
  }

  /**
   * Actualiza las propiedades editables de la categoría.
   */
  update(changes: Partial<CategoryPayload>): void {
    if (changes.name !== undefined) {
      this.name = changes.name;
    }
    if (changes.colorKey !== undefined) {
      this.colorKey = changes.colorKey;
    }
    if (changes.icon !== undefined) {
      this.icon = changes.icon;
    }
  }

  override toPlainObject(): Category {
    return {
      id: this.id,
      name: this._name,
      colorKey: this.colorKey,
      icon: this.icon,
      createdAt: this.createdAt,
    };
  }
}
