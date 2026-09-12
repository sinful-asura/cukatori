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
    { path: '/app/dashboard', label: 'Dashboard' },
    { path: '/app/goals', label: 'Goals' },
    { path: '/app/habits', label: 'Habits' },
    { path: '/app/exercise', label: 'Exercise' },
    { path: '/app/finance', label: 'Finance' },
    { path: '/app/entertainment', label: 'Entertainment' },
    { path: '/app/journal', label: 'Journal' },
    { path: '/app/timeline', label: 'Timeline' },
    { path: '/app/achievements', label: 'Achievements' },
  ];
}
