export interface SheetRow {
  [key: string]: string | number | null;
}

export interface SheetColumn {
  id: string;
  label: string;
  type: string;
}

export interface SheetData {
  columns: SheetColumn[];
  rows: SheetRow[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
