declare const ASCEND_PRIME_NG_LICENCE: string;

export const environment = {
  apiUrl: '/api',
  /** Injected from `.env` `PRIME_NG_LICENCE` (or `PRIME_NG_LICENSE`) at `ng serve` / `ng build`. */
  primeNgLicense: ASCEND_PRIME_NG_LICENCE,
};
