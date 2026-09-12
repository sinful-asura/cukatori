import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pos-stat',
  template: `
    <div class="pos-stat">
      <p class="label">{{ label() }}</p>
      <p class="value">
        {{ value() }}
        @if (suffix()) {
          <span class="suffix">{{ suffix() }}</span>
        }
      </p>
      @if (delta()) {
        <p class="delta">{{ delta() }}</p>
      }
    </div>
  `,
})
export class PosStat {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly suffix = input<string>('');
  readonly delta = input<string>('');
}
