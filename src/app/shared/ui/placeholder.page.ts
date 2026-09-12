import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-placeholder-page',
  template: `<article class="card"><h1>{{ title }}</h1><p>{{ hint }}</p></article>`,
  styles: [
    `
      .card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 24px;
      }
      p {
        color: var(--text-muted);
      }
    `,
  ],
})
export class PlaceholderPage {
  @Input({ required: true }) title = '';
  @Input() hint = 'This module is being implemented by the swarm.';
}
