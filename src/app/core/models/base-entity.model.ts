export interface IdentifiableEntity {
  readonly id: string;
  readonly createdAt: string;
}

export abstract class BaseEntity<T> implements IdentifiableEntity {
  readonly id: string;
  readonly createdAt: string;

  protected constructor(id?: string, createdAt?: string) {
    this.id = id ?? BaseEntity.generateId();
    this.createdAt = createdAt ?? new Date().toISOString();
  }

  /**
   * Convierte la entidad en un objeto plano serializable.
   */
  abstract toPlainObject(): T;

  /**
   * Valida que un texto requerido no esté vacío y retorna su valor sin espacios extremos.
   */
  protected static validateRequiredText(value: string, errorMessage: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error(errorMessage);
    }
    return trimmed;
  }

  /**
   * Genera un identificador único compatible con WebView y navegadores.
   */
  protected static generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
