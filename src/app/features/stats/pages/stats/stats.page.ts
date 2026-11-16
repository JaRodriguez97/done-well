import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonProgressBar,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarOutline,
  checkmarkDoneOutline,
  flagOutline,
  hourglassOutline,
  listOutline,
  statsChartOutline,
  syncOutline,
  timeOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { combineLatest } from 'rxjs';
import { CATEGORY_ICON_REGISTRY } from '../../../../core/constants/category.constants';
import {
  Category,
  CategoryColorKey,
} from '../../../../core/models/category.model';
import {
  CategoryStatItem,
  DueDateTelemetry,
  PriorityStatItem,
  StatsOverview,
  StatusDistribution,
  SubtasksTelemetry,
} from '../../../../core/models/stats.model';
import { Task, TaskPriority } from '../../../../core/models/task.model';
import { RemoteConfigService } from '../../../../core/services/remote-config.service';
import { CategoriesService } from '../../../categories/services/categories.service';
import { TasksService } from '../../../tasks/services/tasks.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonText,
  ],
})
export class StatsPage implements OnInit {
  readonly viewState$ = combineLatest({
    tasks: this.tasksService.tasks$,
    categories: this.categoriesService.categories$,
  });

  isLoading = true;
  isSyncing = false;
  errorMessage: string | null = null;

  constructor(
    private readonly tasksService: TasksService,
    private readonly categoriesService: CategoriesService,
    private readonly remoteConfigService: RemoteConfigService,
  ) {
    addIcons({
      ...CATEGORY_ICON_REGISTRY,
      statsChartOutline,
      syncOutline,
      alertCircleOutline,
      flagOutline,
      checkmarkDoneOutline,
      timeOutline,
      hourglassOutline,
      listOutline,
      calendarOutline,
      trendingUpOutline,
    });
  }

  ngOnInit(): void {
    void this.initializeStats();
  }

  /**
   * Carga tareas y categorías locales para calcular las métricas de progreso.
   */
  async initializeStats(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      await Promise.all([
        this.tasksService.loadTasks(),
        this.categoriesService.loadCategories(),
      ]);
    } catch {
      this.errorMessage = 'No se pudieron cargar los datos para estadísticas.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Sincroniza manualmente el estado de los flags remotos desde Firebase Remote Config.
   */
  async onRefreshRemoteConfig(): Promise<void> {
    this.isSyncing = true;
    try {
      await this.remoteConfigService.syncFlags();
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Calcula el resumen general y el avance por cada categoría registrada.
   */
  buildStatsOverview(tasks: Task[], categories: Category[]): StatsOverview {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const completionPercent = Math.round(completionRatio * 100);

    const categoryStats: CategoryStatItem[] = categories.map((category) => {
      const categoryTasks = tasks.filter(
        (task) => task.categoryId === category.id,
      );
      return this.toStatItem(
        category.id,
        category.name,
        category.icon,
        category.colorKey,
        categoryTasks,
      );
    });

    const uncategorizedTasks = tasks.filter((task) => task.categoryId === null);
    if (uncategorizedTasks.length > 0) {
      categoryStats.push(
        this.toStatItem(
          'uncategorized',
          'Sin categoría',
          'pricetag-outline',
          'otros',
          uncategorizedTasks,
        ),
      );
    }

    const priorityStats: PriorityStatItem[] = [
      this.buildPriorityItem(tasks, 'high', 'Alta', '#FF7660'),
      this.buildPriorityItem(tasks, 'medium', 'Media', '#FFCC00'),
      this.buildPriorityItem(tasks, 'low', 'Baja', '#40E0D0'),
    ];

    const statusPending = tasks.filter(
      (task) => (task.status ?? 'pending') === 'pending',
    ).length;
    const statusInProgress = tasks.filter(
      (task) => task.status === 'in_progress',
    ).length;
    const statusCompleted = tasks.filter(
      (task) => task.completed || task.status === 'completed',
    ).length;

    const statusDistribution: StatusDistribution = {
      pending: statusPending,
      inProgress: statusInProgress,
      completed: statusCompleted,
      pendingRatio: totalTasks > 0 ? statusPending / totalTasks : 0,
      inProgressRatio: totalTasks > 0 ? statusInProgress / totalTasks : 0,
      completedRatio: totalTasks > 0 ? statusCompleted / totalTasks : 0,
    };

    const allSubtasks = tasks.flatMap((t) => t.subtasks ?? []);
    const subtasksTotal = allSubtasks.length;
    const subtasksCompleted = allSubtasks.filter((s) => s.completed).length;
    const subtasksTelemetry: SubtasksTelemetry = {
      total: subtasksTotal,
      completed: subtasksCompleted,
      pending: subtasksTotal - subtasksCompleted,
      completionPercent:
        subtasksTotal > 0
          ? Math.round((subtasksCompleted / subtasksTotal) * 100)
          : 0,
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const tasksWithDueDate = tasks.filter((t) => !!t.dueDate);
    const overdueTasks = tasks.filter(
      (t) => !t.completed && !!t.dueDate && t.dueDate < todayStr,
    ).length;
    const onTrackTasks = tasksWithDueDate.length - overdueTasks;

    const dueDateTelemetry: DueDateTelemetry = {
      withDueDate: tasksWithDueDate.length,
      overdue: overdueTasks,
      onTrack: onTrackTasks,
      noDueDate: totalTasks - tasksWithDueDate.length,
    };

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRatio,
      completionPercent,
      categoryStats,
      priorityStats,
      statusDistribution,
      subtasksTelemetry,
      dueDateTelemetry,
    };
  }

  private buildPriorityItem(
    tasks: Task[],
    priority: TaskPriority,
    label: string,
    colorHex: string,
  ): PriorityStatItem {
    const scoped = tasks.filter((task) => task.priority === priority);
    const total = scoped.length;
    const completed = scoped.filter((task) => task.completed).length;
    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const shareOfTotal = tasks.length > 0 ? total / tasks.length : 0;

    return {
      priority,
      label,
      colorHex,
      total,
      completed,
      completionPercent,
      shareOfTotal,
    };
  }

  private toStatItem(
    id: string,
    name: string,
    icon: string,
    colorKey: CategoryColorKey,
    scopedTasks: Task[],
  ): CategoryStatItem {
    const total = scopedTasks.length;
    const completed = scopedTasks.filter((task) => task.completed).length;
    const completionRatio = total > 0 ? completed / total : 0;

    return {
      id,
      name,
      icon,
      colorKey,
      total,
      completed,
      completionRatio,
      completionPercent: Math.round(completionRatio * 100),
    };
  }
}
