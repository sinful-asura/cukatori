export function asPayload(value: Record<string, unknown> | null | undefined): Record<string, unknown> {
  return value ?? {};
}

export function payloadNumber(payload: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

export function payloadString(payload: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return null;
}

export function workoutVolumeKg(payload: Record<string, unknown>): number {
  return payloadNumber(payload, 'volumeKg', 'volume', 'totalVolumeKg', 'totalVolume') ?? 0;
}

export function workoutDurationMin(payload: Record<string, unknown>): number | null {
  return payloadNumber(payload, 'durationMin', 'durationMinutes', 'duration', 'minutes');
}

export function moneyAmount(payload: Record<string, unknown>): number {
  const cents = payloadNumber(payload, 'amountCents', 'cents');
  if (cents != null) {
    return cents / 100;
  }
  return payloadNumber(payload, 'amount', 'value') ?? 0;
}

export function mediaKind(payload: Record<string, unknown>): string {
  return (payloadString(payload, 'mediaType', 'type', 'kind') ?? 'other').toLowerCase();
}

export function volumeDeltaPercent(payload: Record<string, unknown>): number | null {
  const direct = payloadNumber(payload, 'volumeDeltaPercent', 'volumeChangePercent');
  if (direct != null) {
    return direct;
  }
  const vsLast = payload.vsLast;
  if (vsLast && typeof vsLast === 'object') {
    return payloadNumber(vsLast as Record<string, unknown>, 'volumeDeltaPercent', 'percent');
  }
  return null;
}

export interface MuscleShare {
  muscle: string;
  amount: number;
}

export function muscleShares(payload: Record<string, unknown>): MuscleShare[] {
  const mix = payload.muscleMix ?? payload.muscles ?? payload.muscleDistribution;
  if (Array.isArray(mix)) {
    return mix.flatMap((item) => {
      if (typeof item === 'string' && item.trim()) {
        return [{ muscle: item.trim(), amount: 1 }];
      }
      if (item && typeof item === 'object') {
        const row = item as Record<string, unknown>;
        const muscle = payloadString(row, 'muscle', 'name', 'id');
        if (!muscle) {
          return [];
        }
        return [
          {
            muscle,
            amount: payloadNumber(row, 'volumeKg', 'volume', 'percent', 'amount', 'value') ?? 1,
          },
        ];
      }
      return [];
    });
  }
  if (mix && typeof mix === 'object') {
    return Object.entries(mix as Record<string, unknown>).flatMap(([muscle, amount]) => {
      const n = typeof amount === 'number' ? amount : Number(amount);
      if (!muscle || !Number.isFinite(n)) {
        return [];
      }
      return [{ muscle, amount: n }];
    });
  }
  return [];
}

export function formatEur(amount: number): string {
  return `€${Math.round(amount).toLocaleString('en-GB')}`;
}

export function formatKg(amount: number): string {
  return `${Math.round(amount).toLocaleString('en-GB')} kg`;
}

export function formatPercent(value: number): number {
  return Math.round(value);
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : (pluralForm ?? `${singular}s`);
}

export function percentDelta(current: number, previous: number): number | null {
  if (previous <= 0) {
    return null;
  }
  return formatPercent(((current - previous) / previous) * 100);
}
