import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { CelebrationHost } from './shared/ui/celebration-host';

@Component({
  imports: [RouterOutlet, Toast, CelebrationHost],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
