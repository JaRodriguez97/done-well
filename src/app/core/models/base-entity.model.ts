import { generateEntityId, validateRequiredText } from '../utils/entity.utils';

export interface IdentifiableEntity {
  readonly id: string;
  readonly createdAt: string;
}

export interface SerializableEntity<T> {
  toPlainObject(): T;
}

export abstract class BaseEntity<T> implements IdentifiableEntity, SerializableEntity<T> {
  readonly id: string;
  readonly createdAt: string;

  constructor(id?: string, createdAt?: string) {
    this.id = id ?? generateEntityId();
    this.createdAt = createdAt ?? new Date().toISOString();
  }

  /**
   * Convierte la entidad en un objeto plano serializable.
   */
  abstract toPlainObject(): T;

  /**
   * Compara dos entidades por su identificador único para validar identidad de dominio.
   */
  equals(other: IdentifiableEntity | null | undefined): boolean {
    if (!other) {
      return false;
    }
    return this.id === other.id;
  }

  /**
   * Valida texto requerido delegando a la función pura de utilidad.
   */
  protected static validateRequiredText(value: string, errorMessage: string): string {
    return validateRequiredText(value, errorMessage);
  }

  /**
   * Genera un identificador único delegando a la función pura de utilidad.
   */
  protected static generateId(): string {
    return generateEntityId();
  }
}
