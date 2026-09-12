import { Routes } from '@angular/router';
import { PlaceholderPage } from '../../shared/ui/placeholder.page';

export const FINANCE_ROUTES: Routes = [
  { path: '', component: PlaceholderPage, data: { title: 'Finance' } },
];
