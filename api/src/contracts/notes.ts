export interface NoteDto {
  id: string;
  entityType: string;
  entityId: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteWriteInput {
  entityType: string;
  entityId: string;
  body: string;
  tags?: string[];
}
