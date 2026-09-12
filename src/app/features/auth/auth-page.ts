import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { map } from 'rxjs';
import { AuthApi } from '../../core/api/auth.api';
import { safeReturnUrl } from '../../core/safe-return-url';
import { formatAuthError, GoogleSignIn } from './google-sign-in';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!password || !confirm || password === confirm) {
    return null;
  }
  return { passwordMismatch: true };
}

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, RouterLink, Button, InputText, GoogleSignIn],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthApi);

  readonly mode = toSignal(
    this.route.data.pipe(map((data) => (data['mode'] === 'register' ? 'register' : 'login'))),
    { initialValue: this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login' },
  );
  readonly isRegister = computed(() => this.mode() === 'register');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly form = this.fb.group(
    {
      displayName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''],
    },
    { validators: passwordsMatch },
  );

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe(() => {
      this.error.set(null);
      this.form.reset();
      this.syncConfirmValidators();
    });
  }

  submit(): void {
    this.syncConfirmValidators();
    if (this.loading() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { displayName, email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    const request$ = this.isRegister()
      ? this.auth.register(email.trim(), password, displayName.trim() || undefined)
      : this.auth.login(email.trim(), password);
    request$.subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl(this.returnUrl());
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(formatAuthError(err, this.isRegister()));
      },
    });
  }

  onGoogleSignedIn(): void {
    void this.router.navigateByUrl(this.returnUrl());
  }

  switchQueryParams(): Record<string, string> | null {
    const raw = this.route.snapshot.queryParamMap.get('returnUrl');
    return raw ? { returnUrl: raw } : null;
  }

  fieldInvalid(name: 'email' | 'password' | 'confirmPassword' | 'displayName'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  confirmMismatch(): boolean {
    return (
      this.isRegister() &&
      this.form.hasError('passwordMismatch') &&
      this.form.controls.confirmPassword.touched
    );
  }

  private returnUrl(): string {
    return safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
  }

  private syncConfirmValidators(): void {
    const confirm = this.form.controls.confirmPassword;
    if (this.isRegister()) {
      confirm.setValidators([Validators.required]);
    } else {
      confirm.clearValidators();
    }
    confirm.updateValueAndValidity({ emitEvent: false });
  }
}
