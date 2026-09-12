import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { AuthApi } from '../../core/api/auth.api';
import { SessionService } from '../../core/session.service';
import { GoogleSignIn } from '../auth/google-sign-in';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, Button, GoogleSignIn],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);
  readonly session = inject(SessionService);

  constructor() {
    this.auth.restore();
  }

  onGoogleSignedIn(): void {
    void this.router.navigateByUrl('/os');
  }
}
