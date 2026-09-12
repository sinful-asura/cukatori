import { Routes } from '@angular/router';
import { PlaceholderPage } from '../../shared/ui/placeholder.page';

export const TIMELINE_ROUTES: Routes = [
  { path: '', component: PlaceholderPage, data: { title: 'Timeline' } },
];
