export interface MosquitoIndexSnapshot {
  districtId: number;
  mosquitoIndex: number;
  level: number;
  date: Date;
  updatedAt: Date;
}

export interface DailyRefreshResult {
  districtName: string;
  success: boolean;
  mosquitoIndex?: number;
  level?: number;
  errorMessage?: string;
}
