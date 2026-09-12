import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { SelectButton } from 'primeng/selectbutton';
import { PosPanelHeader } from '../../../shared/ui/pos';

export const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  traps: 'Traps',
  lats: 'Lats',
  'mid-back': 'Mid-back',
  'lower-back': 'Lower back',
  adductors: 'Adductors',
  neck: 'Neck',
};

@Component({
  selector: 'ascend-body-map',
  imports: [FormsModule, Card, SelectButton, PosPanelHeader],
  templateUrl: './body-map.html',
  styleUrl: './body-map.scss',
})
export class BodyMap {
  readonly flagged = input<string[]>([]);
  readonly selected = model<string | null>(null);
  readonly view = model<'front' | 'back'>('front');
  readonly viewOptions = [
    { label: 'Front', value: 'front' },
    { label: 'Back', value: 'back' },
  ];

  pick(id: string): void {
    this.selected.set(this.selected() === id ? null : id);
  }

  isFlagged(id: string): boolean {
    return this.flagged().includes(id);
  }

  isSelected(id: string): boolean {
    return this.selected() === id;
  }

  label(id: string | null): string {
    return id ? (MUSCLE_LABELS[id] ?? id) : 'Select a region';
  }
}
