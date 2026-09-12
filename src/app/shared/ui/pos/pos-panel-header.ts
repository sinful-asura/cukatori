import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pos-panel-header',
  template: `
    <div class="pos-panel-header">
      <div>
        <h2>{{ title() }}</h2>
        @if (subtitle()) {
          <p>{{ subtitle() }}</p>
        }
      </div>
      <ng-content />
    </div>
  `,
})
export class PosPanelHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
