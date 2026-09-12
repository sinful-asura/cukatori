import { Component, computed, input } from '@angular/core';

export type PosChartSeries = { label: string; values: number[]; color: string };

@Component({
  selector: 'app-pos-line-chart',
  template: `
    <div class="pos-chart">
      <div class="pos-chart-row">
        <div class="pos-chart-y" [style.height.px]="height()">
          @for (tick of ticks(); track tick) {
            <span>{{ tick }}</span>
          }
        </div>
        <div class="pos-chart-plot" [style.height.px]="height()">
          <div class="pos-chart-grid"></div>
          <svg
            [attr.viewBox]="'0 0 ' + width + ' ' + height()"
            preserveAspectRatio="none"
          >
            @for (line of paths(); track line.label) {
              <path
                [attr.d]="line.d"
                fill="none"
                [attr.stroke]="line.color"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
              />
              <circle
                [attr.cx]="line.cx"
                [attr.cy]="line.cy"
                r="4"
                [attr.fill]="line.color"
                vector-effect="non-scaling-stroke"
              />
            }
          </svg>
        </div>
      </div>
      <div class="pos-chart-x">
        @for (label of labels(); track label) {
          <span>{{ label }}</span>
        }
      </div>
    </div>
  `,
})
export class PosLineChart {
  readonly series = input.required<PosChartSeries[]>();
  readonly labels = input.required<string[]>();
  readonly yLabels = input<string[]>([]);
  readonly height = input(160);
  readonly width = 560;

  readonly ticks = computed(() => {
    const custom = this.yLabels();
    if (custom.length) return custom;
    const max = this.max();
    return [String(max), String(Math.round(max / 2)), '0'];
  });

  readonly paths = computed(() => {
    const width = this.width;
    const height = this.height();
    const padX = 8;
    const padY = 8;
    const max = this.max();
    const count = Math.max(...this.series().map((s) => s.values.length), 2);
    const xAt = (i: number) => padX + (i / (count - 1)) * (width - padX * 2);
    const yAt = (value: number) => padY + (1 - value / max) * (height - padY * 2);

    return this.series().map((line) => {
      const d = line.values
        .map((value, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(value)}`)
        .join(' ');
      const last = line.values.length - 1;
      return {
        label: line.label,
        color: line.color,
        d,
        cx: xAt(last),
        cy: yAt(line.values[last] ?? 0),
      };
    });
  });

  private max(): number {
    return Math.max(...this.series().flatMap((s) => s.values), 1);
  }
}
