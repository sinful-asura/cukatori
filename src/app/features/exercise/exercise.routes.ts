import { Routes } from '@angular/router';

export const EXERCISE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./exercise-library-page').then((m) => m.ExerciseLibraryPage),
  },
  {
    path: 'insights',
    loadChildren: () => import('./insights/insights.routes').then((m) => m.INSIGHTS_ROUTES),
  },
];
