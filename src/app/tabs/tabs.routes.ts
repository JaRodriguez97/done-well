import type { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../features/tasks/pages/tasks/tasks.page').then(
            (m) => m.TasksPage,
          ),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../features/categories/pages/categories/categories.page').then(
            (m) => m.CategoriesPage,
          ),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../features/stats/pages/stats/stats.page').then(
            (m) => m.StatsPage,
          ),
      },
      {
        path: 'tasks',
        redirectTo: 'tab1',
        pathMatch: 'full',
      },
      {
        path: 'categories',
        redirectTo: 'tab2',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
