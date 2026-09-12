import { Routes } from '@angular/router';
import { ExercisePage } from './exercise-page';

export const EXERCISE_ROUTES: Routes = [
  { path: '', component: ExercisePage },
  {
    path: 'insights',
    loadChildren: () => import('./insights/insights.routes').then((m) => m.INSIGHTS_ROUTES),
  },
];
