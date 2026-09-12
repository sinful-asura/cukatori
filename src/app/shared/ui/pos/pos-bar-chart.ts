import { Component, computed, input } from '@angular/core';
import type { PosChartSeries } from './pos-line-chart';

@Component({
  selector: 'app-pos-bar-chart',
  template: `
    <div class="pos-chart">
      <div class="pos-chart-row">
        <div class="pos-chart-y" [style.height.px]="height()">
          @for (tick of ticks(); track tick) {
            <span>{{ tick }}</span>
          }
        </div>
        <div
          class="pos-chart-plot pos-chart-bars"
          [class.thick]="thick()"
          [class.grouped]="grouped()"
          [style.height.px]="height()"
        >
          <div class="pos-chart-grid"></div>
          @for (label of labels(); track label; let i = $index) {
            <div class="pos-bar-group">
              @for (group of groups(); track group.label || label) {
                <div
                  class="pos-bar"
                  [style.height]="barHeight(group.values[i] ?? 0)"
                  [style.background]="barColor(group, i)"
                ></div>
              }
            </div>
          }
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
export class PosBarChart {
  readonly values = input<number[]>([]);
  readonly series = input<PosChartSeries[]>([]);
  readonly labels = input.required<string[]>();
  readonly yLabels = input<string[]>([]);
  readonly color = input('#0091ff');
  readonly colors = input<string[]>([]);
  readonly height = input(140);
  readonly thick = input(false);

  readonly groups = computed<PosChartSeries[]>(() => {
    const series = this.series();
    if (series.length) return series;
    return [{ label: '', values: this.values(), color: this.color() }];
  });

  readonly grouped = computed(() => this.groups().length > 1);

  readonly ticks = computed(() => {
    const custom = this.yLabels();
    if (custom.length) return custom;
    const max = this.max();
    return [String(max), String(Math.round(max / 2)), '0'];
  });

  barHeight(value: number): string {
    if (value === 0) return '4px';
    return `${Math.max(8, (value / this.max()) * 100)}%`;
  }

  barColor(group: PosChartSeries, index: number): string {
    const value = group.values[index] ?? 0;
    if (value === 0) return '#3b3a37';
    if (this.grouped()) return group.color;
    return this.colors()[index] ?? group.color;
  }

  private max(): number {
    return Math.max(...this.groups().flatMap((group) => group.values), 1);
  }
}
