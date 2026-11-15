import { CategoryColorKey } from './category.model';

export interface CategoryStatItem {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly colorKey: CategoryColorKey;
  readonly total: number;
  readonly completed: number;
  readonly completionRatio: number;
  readonly completionPercent: number;
}

export interface StatsOverview {
  readonly totalTasks: number;
  readonly completedTasks: number;
  readonly pendingTasks: number;
  readonly completionRatio: number;
  readonly completionPercent: number;
  readonly categoryStats: CategoryStatItem[];
}
