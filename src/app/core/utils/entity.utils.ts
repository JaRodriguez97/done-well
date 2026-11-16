import { IdentifiableEntity } from '../models/base-entity.model';

/**
 * Valida que una cadena de texto requerida no esté vacía tras remover espacios en los extremos.
 * Retorna la cadena limpia o lanza un Error si está vacía.
 */
export function validateRequiredText(value: string, errorMessage: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(errorMessage);
  }
  return trimmed;
}

/**
 * Genera un identificador único utilizando crypto.randomUUID() cuando está disponible,
 * o un fallback basado en timestamp y números pseudoaleatorios para compatibilidad con WebViews.
 */
export function generateEntityId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Ordena un conjunto de entidades identificables por su fecha de creación (createdAt).
 */
export function sortEntitiesByCreatedAt<T extends IdentifiableEntity>(
  entities: readonly T[],
  direction: 'asc' | 'desc' = 'desc',
): T[] {
  return [...entities].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return direction === 'asc' ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Busca una entidad dentro de un arreglo por su identificador único.
 */
export function findEntityById<T extends IdentifiableEntity>(
  entities: readonly T[],
  id: string,
): T | null {
  return entities.find((entity) => entity.id === id) ?? null;
}
