import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="pos-page-header">
      <div>
        <h1>{{ title() }}</h1>
        @if (kicker()) {
          <p class="kicker">{{ kicker() }}</p>
        }
      </div>
      <ng-content />
    </header>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly kicker = input<string>('');
}
