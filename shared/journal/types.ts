/** Journal list fields may be plaintext. Bodies are AES-GCM ciphertext + IV only. */

export interface JournalImagePlaintext {
  mime: string;
  data: string;
}

export interface JournalPlaintext {
  body: string;
  image?: JournalImagePlaintext;
}

export interface JournalEntryDto {
  id: string;
  title: string;
  tags: string[];
  ciphertext: string;
  iv: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntryRequest {
  title: string;
  tags: string[];
  ciphertext: string;
  iv: string;
  createdAt?: string;
}

export interface UpdateJournalEntryRequest {
  title?: string;
  tags?: string[];
  ciphertext?: string;
  iv?: string;
}

export interface JournalVaultConfiguredDto {
  configured: true;
  salt: string;
  verifier: string;
  verifierIv: string;
}

export interface JournalVaultUnsetDto {
  configured: false;
}

export type JournalVaultStatusDto = JournalVaultConfiguredDto | JournalVaultUnsetDto;

export interface CreateJournalVaultRequest {
  salt: string;
  verifier: string;
  verifierIv: string;
}
