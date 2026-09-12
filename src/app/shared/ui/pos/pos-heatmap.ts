import { Component, computed, input } from '@angular/core';

const HEAT = ['#2a2a28', '#16324a', '#0a4f7a', '#0070c9', '#0091ff'];

@Component({
  selector: 'app-pos-heatmap',
  template: `
    @if (year()) {
      <div class="pos-year-heat">
        @for (week of weeks(); track $index) {
          <div class="pos-year-col">
            @for (intensity of week; track $index) {
              <div
                class="pos-heat-cell"
                [style.width.px]="cell()"
                [style.height.px]="cell()"
                [style.background]="HEAT[intensity] ?? HEAT[0]"
              ></div>
            }
          </div>
        }
      </div>
    } @else {
      <div
        class="pos-heat"
        [style.grid-template-columns]="'repeat(' + columns() + ', ' + cell() + 'px)'"
      >
        @for (intensity of days(); track $index) {
          <div
            class="pos-heat-cell"
            [style.width.px]="cell()"
            [style.height.px]="cell()"
            [style.background]="HEAT[intensity] ?? HEAT[0]"
          ></div>
        }
      </div>
    }
  `,
})
export class PosHeatmap {
  readonly HEAT = HEAT;
  readonly days = input.required<number[]>();
  readonly columns = input(7);
  readonly cell = input(11);
  readonly year = input(false);

  readonly weeks = computed(() => {
    const days = this.days();
    const count = Math.ceil(days.length / 7);
    return Array.from({ length: count }, (_, week) =>
      Array.from({ length: 7 }, (_, day) => days[week * 7 + day] ?? 0),
    );
  });
}
