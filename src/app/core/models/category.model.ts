import { BaseEntity, IdentifiableEntity } from './base-entity.model';

export type CategoryColorKey =
  | 'trabajo'
  | 'personal'
  | 'estudios'
  | 'compras'
  | 'urgente'
  | 'otros';

export interface Category extends IdentifiableEntity {
  name: string;
  colorKey: CategoryColorKey;
  icon: string;
}

export class CategoryItem extends BaseEntity<Category> implements Category {
  private static readonly EMPTY_NAME_ERROR = 'El nombre de la categoría no puede estar vacío.';

  private _name: string;
  colorKey: CategoryColorKey;
  icon: string;

  constructor(params: {
    id?: string;
    name: string;
    colorKey?: CategoryColorKey;
    icon?: string;
    createdAt?: string;
  }) {
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
  update(changes: { name?: string; colorKey?: CategoryColorKey; icon?: string }): void {
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
