import { Component, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Popover } from 'primeng/popover';
import { AuthApi } from '../../api/auth.api';
import { NotificationsApi, type NotificationDto } from '../../api/notifications.api';
import { QuickLogPaletteService } from '../../quick-log/quick-log-palette.service';
import { SessionService } from '../../session.service';

export type ShellLink = { path: string; label: string; icon: string; exact?: boolean };

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Popover],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly palette = inject(QuickLogPaletteService);
  private readonly notificationsApi = inject(NotificationsApi);
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly notesPop = viewChild<Popover>('notes');

  readonly session = inject(SessionService);
  readonly inbox = signal<NotificationDto[]>([]);
  readonly unread = signal(0);
  readonly accountOpen = signal(false);
  readonly displayName = computed(() => this.session.displayName() ?? 'Account');
  readonly workspaceLabel = computed(() => `${this.displayName()}’s workspace`);
  readonly initials = computed(() => initialsFrom(this.displayName()));
  readonly pictureUrl = computed(() => this.session.user()?.pictureUrl ?? null);

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
    { path: '/os/achievements', label: 'Achievements', icon: 'pi pi-trophy', exact: true },
    { path: '/os/exercise/insights', label: 'Insights', icon: 'pi pi-map' },
    { path: '/os/photos', label: 'Photos', icon: 'pi pi-images' },
    { path: '/os/settings', label: 'Settings', icon: 'pi pi-cog' },
  ];

  constructor() {
    this.refreshUnread();
  }

  @HostListener('document:click')
  closeAccount(): void {
    this.accountOpen.set(false);
  }

  openQuickLog(): void {
    this.palette.show();
  }

  toggleAccount(event: Event): void {
    event.stopPropagation();
    this.accountOpen.update((open) => !open);
  }

  openNotes(event: Event): void {
    event.stopPropagation();
    this.accountOpen.set(false);
    this.notificationsApi.list().subscribe({
      next: (rows) => this.inbox.set(rows.slice(0, 8)),
      error: () => this.inbox.set([]),
    });
    this.notesPop()?.toggle(event);
  }

  readNote(note: NotificationDto): void {
    if (note.readAt) {
      return;
    }
    this.notificationsApi.markRead(note.id).subscribe({
      next: (updated) => {
        this.inbox.update((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
        this.unread.update((count) => Math.max(0, count - 1));
      },
    });
  }

  logout(event: Event): void {
    event.stopPropagation();
    this.accountOpen.set(false);
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/landing');
    });
  }

  private refreshUnread(): void {
    this.notificationsApi.list(true).subscribe({
      next: (rows) => this.unread.set(rows.length),
      error: () => this.unread.set(0),
    });
  }
}

function initialsFrom(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) {
    return 'A';
  }
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}
