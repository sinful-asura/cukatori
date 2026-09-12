import { Component, HostListener, inject } from '@angular/core';
import { QuickLogCommand } from '../../../core/quick-log/quick-log-command';
import { QuickLogPaletteService } from '../../../core/quick-log/quick-log-palette.service';

@Component({
  selector: 'app-celebration-host',
  imports: [QuickLogCommand],
  template: `<app-quick-log-command />`,
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
