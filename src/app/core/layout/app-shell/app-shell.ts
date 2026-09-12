import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { QuickLogPaletteService } from '../../quick-log/quick-log-palette.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly palette = inject(QuickLogPaletteService);

  readonly links = [
    { path: '/os/dashboard', label: 'Dashboard' },
    { path: '/os/goals', label: 'Goals' },
    { path: '/os/habits', label: 'Habits' },
    { path: '/os/exercise', label: 'Exercise' },
    { path: '/os/exercise/insights', label: 'Insights' },
    { path: '/os/photos', label: 'Photos' },
    { path: '/os/finance', label: 'Finance' },
    { path: '/os/entertainment', label: 'Entertainment' },
    { path: '/os/journal', label: 'Journal' },
    { path: '/os/reports', label: 'Reports' },
    { path: '/os/timeline', label: 'Timeline' },
    { path: '/os/achievements', label: 'Achievements' },
    { path: '/os/settings', label: 'Settings' },
  ];

  openQuickLog(): void {
    this.palette.show();
  }
}
