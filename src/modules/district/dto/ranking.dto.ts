export interface RankingItemDto {
  rank: number;
  id: number;
  name: string;
  mosquitoIndex: number;
  level: string;
}

export interface RankingResponseDto {
  updatedAt: string | null;
  ranking: RankingItemDto[];
}