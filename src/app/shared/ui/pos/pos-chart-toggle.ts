import { Component, model } from '@angular/core';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

export type PosChartMode = 'line' | 'bar';

@Component({
  selector: 'app-pos-chart-toggle',
  imports: [FormsModule, SelectButton],
  template: `
    <p-selectbutton
      [options]="options"
      optionLabel="label"
      optionValue="value"
      size="small"
      [(ngModel)]="mode"
      aria-label="Chart type"
    />
  `,
})
export class PosChartToggle {
  readonly mode = model<PosChartMode>('line');
  readonly options: { label: string; value: PosChartMode }[] = [
    { label: 'Line', value: 'line' },
    { label: 'Bar', value: 'bar' },
  ];
}
