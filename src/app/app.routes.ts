import { RedirectFunction, Routes } from '@angular/router';

const redirectAppToOs: RedirectFunction = ({ url }) => {
  const rest = url.map((segment) => segment.path).filter(Boolean).join('/');
  return rest ? `/os/${rest}` : '/os';
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'landing',
  },
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'os',
    loadComponent: () => import('./core/layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'habits',
        loadChildren: () => import('./features/habits/habits.routes').then((m) => m.HABITS_ROUTES),
      },
      {
        path: 'goals',
        loadChildren: () => import('./features/goals/goals.routes').then((m) => m.GOALS_ROUTES),
      },
      {
        path: 'exercise',
        loadChildren: () =>
          import('./features/exercise/exercise.routes').then((m) => m.EXERCISE_ROUTES),
      },
      {
        path: 'photos',
        loadChildren: () =>
          import('./features/photos/photos.routes').then((m) => m.PHOTOS_ROUTES),
      },
      {
        path: 'entertainment',
        loadChildren: () =>
          import('./features/entertainment/entertainment.routes').then(
            (m) => m.ENTERTAINMENT_ROUTES,
          ),
      },
      {
        path: 'finance',
        loadChildren: () =>
          import('./features/finance/finance.routes').then((m) => m.FINANCE_ROUTES),
      },
      {
        path: 'journal',
        loadChildren: () =>
          import('./features/journal/journal.routes').then((m) => m.JOURNAL_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'timeline',
        loadChildren: () =>
          import('./features/timeline/timeline.routes').then((m) => m.TIMELINE_ROUTES),
      },
      {
        path: 'achievements',
        loadChildren: () =>
          import('./features/achievements/achievements.routes').then((m) => m.ACHIEVEMENTS_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
    ],
  },
  {
    path: 'app',
    children: [{ path: '**', redirectTo: redirectAppToOs }],
  },
];
