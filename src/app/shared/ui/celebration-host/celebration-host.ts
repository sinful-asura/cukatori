import { Component, HostListener, ViewEncapsulation, inject } from '@angular/core';
import { Toast } from 'primeng/toast';
import { QuickLogCommand } from '../../../core/quick-log/quick-log-command';
import { QuickLogPaletteService } from '../../../core/quick-log/quick-log-palette.service';

@Component({
  selector: 'app-celebration-host',
  imports: [QuickLogCommand, Toast],
  templateUrl: './celebration-host.html',
  styleUrl: './celebration-host.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CelebrationHost {
  private readonly palette = inject(QuickLogPaletteService);

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.palette.toggle();
    }
  }
}
