import { BaseEntity, IdentifiableEntity } from './base-entity.model';

export type CategoryColorKey =
  | 'trabajo'
  | 'personal'
  | 'estudios'
  | 'compras'
  | 'urgente'
  | 'otros';

export interface CategoryPayload {
  name: string;
  colorKey: CategoryColorKey;
  icon?: string;
}

export interface Category extends IdentifiableEntity, CategoryPayload {
  icon: string;
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
    this._name = BaseEntity.validateRequiredText(params.name, CategoryItem.EMPTY_NAME_ERROR);
    this.colorKey = params.colorKey ?? 'otros';
    this.icon = params.icon ?? 'pricetag-outline';
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = BaseEntity.validateRequiredText(value, CategoryItem.EMPTY_NAME_ERROR);
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
