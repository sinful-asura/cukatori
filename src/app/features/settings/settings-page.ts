import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToggleButton } from 'primeng/togglebutton';
import { SettingsStore, type CurrencyCode, type MassUnit, type ThemeMode } from './settings.store';

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, Button, Card, InputText, Select, ToggleButton],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPage implements OnInit {
  readonly store = inject(SettingsStore);

  readonly unitOptions: { label: string; value: MassUnit }[] = [
    { label: 'Kilograms (kg)', value: 'kg' },
    { label: 'Pounds (lb)', value: 'lb' },
  ];

  readonly currencyOptions: { label: string; value: CurrencyCode }[] = [
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'US dollar (USD)', value: 'USD' },
    { label: 'Pound (GBP)', value: 'GBP' },
  ];

  ngOnInit(): void {
    this.store.applyTheme(this.store.settings().theme);
  }

  get dark(): boolean {
    return this.store.settings().theme === 'dark';
  }

  setTheme(dark: boolean): void {
    const theme: ThemeMode = dark ? 'dark' : 'light';
    this.store.patch({ theme });
  }

  setUnits(units: MassUnit): void {
    this.store.patch({ units });
  }

  setCurrency(currency: CurrencyCode): void {
    this.store.patch({ currency });
  }

  setDisplayName(displayName: string): void {
    this.store.patch({ displayName });
  }
}
