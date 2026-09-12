import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  readonly links = [
    { path: '/os/dashboard', label: 'Dashboard' },
    { path: '/os/goals', label: 'Goals' },
    { path: '/os/habits', label: 'Habits' },
    { path: '/os/exercise', label: 'Exercise' },
    { path: '/os/finance', label: 'Finance' },
    { path: '/os/entertainment', label: 'Entertainment' },
    { path: '/os/journal', label: 'Journal' },
    { path: '/os/timeline', label: 'Timeline' },
    { path: '/os/achievements', label: 'Achievements' },
  ];
}
