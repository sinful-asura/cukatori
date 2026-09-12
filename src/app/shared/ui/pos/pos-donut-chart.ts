import { Component, computed, input } from '@angular/core';

export type PosDonutSegment = {
  label: string;
  value: number;
  color: string;
  pct: number;
};

@Component({
  selector: 'app-pos-donut-chart',
  template: `
    <div class="pos-donut">
      <div class="pos-donut-ring">
        <svg
            class="pos-donut-svg"
            [attr.width]="size"
            [attr.height]="size"
            [attr.viewBox]="'0 0 ' + size + ' ' + size"
          >
          <circle
            [attr.cx]="size / 2"
            [attr.cy]="size / 2"
            [attr.r]="radius"
            fill="none"
            stroke="#2a2a28"
            [attr.stroke-width]="stroke"
          />
          @for (arc of arcs(); track arc.label) {
            <circle
              [attr.cx]="size / 2"
              [attr.cy]="size / 2"
              [attr.r]="radius"
              fill="none"
              [attr.stroke]="arc.color"
              [attr.stroke-width]="stroke"
              [attr.stroke-dasharray]="arc.dash"
              [attr.stroke-dashoffset]="arc.offset"
            />
          }
        </svg>
        <div class="pos-donut-center">
          <p class="total">{{ total() }}</p>
          <p class="caption">{{ caption() }}</p>
        </div>
      </div>
      <ul>
        @for (segment of segments(); track segment.label) {
          <li>
            <span class="swatch" [style.background]="segment.color"></span>
            <span class="name">{{ segment.label }}</span>
            <span class="pct">{{ segment.pct }}%</span>
          </li>
        }
      </ul>
    </div>
  `,
})
export class PosDonutChart {
  readonly segments = input.required<PosDonutSegment[]>();
  readonly total = input.required<string>();
  readonly caption = input.required<string>();
  readonly size = 184;
  readonly stroke = 26;
  readonly radius = (this.size - this.stroke) / 2;

  readonly arcs = computed(() => {
    const circumference = 2 * Math.PI * this.radius;
    const segments = this.segments();
    const sum = segments.reduce((acc, segment) => acc + segment.value, 0) || 1;
    let offset = 0;
    return segments.map((segment) => {
      const length = (segment.value / sum) * circumference;
      const arc = {
        label: segment.label,
        color: segment.color,
        dash: `${length} ${circumference - length}`,
        offset: -offset,
      };
      offset += length;
      return arc;
    });
  });
}
