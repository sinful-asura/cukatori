import { Routes } from '@angular/router';
import { PlaceholderPage } from '../../shared/ui/placeholder.page';

export const ENTERTAINMENT_ROUTES: Routes = [
  { path: '', component: PlaceholderPage, data: { title: 'Entertainment' } },
];
