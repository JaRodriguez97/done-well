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
  statsChartOutline,
  syncOutline,
} from 'ionicons/icons';
import { combineLatest } from 'rxjs';
import { CATEGORY_ICON_REGISTRY } from '../../../../core/constants/category.constants';
import {
  Category,
  CategoryColorKey,
} from '../../../../core/models/category.model';
import {
  CategoryStatItem,
  StatsOverview,
} from '../../../../core/models/stats.model';
import { Task } from '../../../../core/models/task.model';
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

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRatio,
      completionPercent,
      categoryStats,
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
