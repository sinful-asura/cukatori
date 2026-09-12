import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { authInterceptor, credentialsInterceptor } from './core/auth.interceptor';
import { environment } from './core/environment';
import { ascendPreset } from './core/theme/ascend.preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([credentialsInterceptor, authInterceptor]),
    ),
    provideAnimationsAsync(),
    MessageService,
    providePrimeNG({
      ripple: true,
      inputVariant: 'filled',
      ...(environment.primeNgLicense ? { license: environment.primeNgLicense } : {}),
      theme: {
        preset: ascendPreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
  ],
};
