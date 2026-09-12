import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { QuickLogPaletteService } from '../../quick-log/quick-log-palette.service';

export type ShellLink = { path: string; label: string; icon: string; exact?: boolean };

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly palette = inject(QuickLogPaletteService);

  readonly primary: ShellLink[] = [
    { path: '/os/dashboard', label: 'Dashboard', icon: 'pi pi-th-large', exact: true },
    { path: '/os/goals', label: 'Goals', icon: 'pi pi-flag' },
    { path: '/os/habits', label: 'Habits', icon: 'pi pi-check-square' },
    { path: '/os/exercise', label: 'Exercise', icon: 'pi pi-heart', exact: true },
    { path: '/os/entertainment', label: 'Entertainment', icon: 'pi pi-video' },
  ];

  readonly secondary: ShellLink[] = [
    { path: '/os/finance', label: 'Finance', icon: 'pi pi-wallet' },
    { path: '/os/journal', label: 'Journal', icon: 'pi pi-book' },
    { path: '/os/reports', label: 'Reports', icon: 'pi pi-chart-bar' },
    { path: '/os/timeline', label: 'Timeline', icon: 'pi pi-clock' },
    { path: '/os/achievements', label: 'Achievements', icon: 'pi pi-trophy' },
    { path: '/os/exercise/insights', label: 'Insights', icon: 'pi pi-map' },
    { path: '/os/photos', label: 'Photos', icon: 'pi pi-images' },
    { path: '/os/settings', label: 'Settings', icon: 'pi pi-cog' },
  ];

  openQuickLog(): void {
    this.palette.show();
  }
}
