import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthApi } from '../../core/api/auth.api';
import { loadGoogleIdentityScript } from '../../core/google-gsi';

@Component({
  selector: 'app-google-sign-in',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="google-sign-in">
      <div #host class="google-sign-in__button"></div>
      @if (message()) {
        <p class="google-sign-in__hint">{{ message() }}</p>
      }
    </div>
  `,
  styles: `
    .google-sign-in {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      min-height: 44px;
    }

    .google-sign-in__button {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .google-sign-in__hint {
      margin: 0;
      color: var(--text-muted);
      font-size: 13px;
      line-height: 18px;
      text-align: center;
    }
  `,
})
export class GoogleSignIn implements AfterViewInit {
  private readonly auth = inject(AuthApi);
  private readonly zone = inject(NgZone);
  private readonly host = viewChild<ElementRef<HTMLDivElement>>('host');

  readonly text = input<'signin_with' | 'signup_with'>('signin_with');
  readonly width = input(320);
  readonly signedIn = output<void>();
  readonly failed = output<string>();

  readonly message = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.auth.getConfig().subscribe({
      next: (cfg) => {
        if (!cfg.googleClientId) {
          this.message.set('Google sign-in is not configured.');
          return;
        }
        void this.render(cfg.googleClientId);
      },
      error: () => this.message.set('Could not load Google sign-in.'),
    });
  }

  private async render(clientId: string): Promise<void> {
    const host = this.host()?.nativeElement;
    if (!host) {
      return;
    }
    try {
      await loadGoogleIdentityScript();
      host.replaceChildren();
      window.google!.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => this.onCredential(response.credential),
        auto_select: false,
      });
      window.google!.accounts.id.renderButton(host, {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        text: this.text(),
        width: this.width(),
      });
      this.message.set(null);
    } catch {
      this.message.set('Could not load Google sign-in.');
    }
  }

  private onCredential(credential: string): void {
    this.zone.run(() => {
      this.auth.googleSignIn(credential).subscribe({
        next: () => this.signedIn.emit(),
        error: (err: unknown) => {
          const text = formatAuthError(err, false);
          this.message.set(text);
          this.failed.emit(text);
        },
      });
    });
  }
}

export function formatAuthError(err: unknown, isRegister: boolean): string {
  const message =
    err instanceof HttpErrorResponse
      ? Array.isArray(err.error?.message)
        ? err.error.message.join(', ')
        : err.error?.message
      : null;
  if (typeof message === 'string') {
    const lower = message.toLowerCase();
    if (lower.includes('already registered')) {
      return 'That email is already registered.';
    }
    if (lower.includes('invalid email or password')) {
      return 'Invalid email or password.';
    }
    if (lower.includes('sign in with google')) {
      return 'Sign in with Google for this account.';
    }
    if (lower.includes('not configured')) {
      return 'Google sign-in is not configured.';
    }
    if (lower.includes('invalid google')) {
      return 'Google could not verify that sign-in. Try again.';
    }
  }
  if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
    return isRegister ? 'Could not create that account.' : 'Invalid email or password.';
  }
  return 'Something went wrong. Try again.';
}
