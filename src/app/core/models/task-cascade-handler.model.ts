/**
 * Contrato abstracto para coordinar la limpieza o eliminación en cascada
 * de tareas asociadas a una categoría eliminada.
 */
export interface TaskCascadeHandler {
  clearCategoryFromTasks(categoryId: string): Promise<void>;
  deleteTasksByCategory(categoryId: string): Promise<void>;
}
