import { CategoryColorKey } from './category.model';
import { TaskPriority } from './task.model';

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

export interface PriorityStatItem {
  readonly priority: TaskPriority;
  readonly label: string;
  readonly colorHex: string;
  readonly total: number;
  readonly completed: number;
  readonly completionPercent: number;
  readonly shareOfTotal: number;
}

export interface StatusDistribution {
  readonly pending: number;
  readonly inProgress: number;
  readonly completed: number;
  readonly pendingRatio: number;
  readonly inProgressRatio: number;
  readonly completedRatio: number;
}

export interface SubtasksTelemetry {
  readonly total: number;
  readonly completed: number;
  readonly pending: number;
  readonly completionPercent: number;
}

export interface DueDateTelemetry {
  readonly withDueDate: number;
  readonly overdue: number;
  readonly onTrack: number;
  readonly noDueDate: number;
}

export interface StatsOverview {
  readonly totalTasks: number;
  readonly completedTasks: number;
  readonly pendingTasks: number;
  readonly completionRatio: number;
  readonly completionPercent: number;
  readonly categoryStats: CategoryStatItem[];
  readonly priorityStats: PriorityStatItem[];
  readonly statusDistribution: StatusDistribution;
  readonly subtasksTelemetry: SubtasksTelemetry;
  readonly dueDateTelemetry: DueDateTelemetry;
}
