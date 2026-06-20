import { RankingRepository } from "../repository/ranking.repository";
import { RankingItemDto, RankingResponseDto } from "../dto/ranking.dto";
import { MosquitoService } from "../../mosquito/service/mosquito.service";

export class RankingService {
  constructor(
    private readonly rankingRepository = new RankingRepository(),
    private readonly mosquitoService = new MosquitoService()
  ) {}

  async getDistrictRanking(limit?: number): Promise<RankingResponseDto> {
    const latestIndexes = await this.rankingRepository.findAllLatestWithDistrict();

    const sortedIndexes = latestIndexes.sort((a, b) => {
      if (b.mosquitoIndex !== a.mosquitoIndex) {
        return b.mosquitoIndex - a.mosquitoIndex;
      }

      return a.district.id - b.district.id;
    });

    const updatedAt = sortedIndexes.reduce<Date | null>((latest, current) => {
      const currentUpdatedAt = current.createdAt ?? current.date;

      if (!latest || currentUpdatedAt > latest) {
        return currentUpdatedAt;
      }

      return latest;
    }, null);

    const ranking: RankingItemDto[] = sortedIndexes.map((index, order) => ({
      rank: order + 1,
      id: index.district.id,
      name: index.district.name,
      mosquitoIndex: index.mosquitoIndex,
      level: this.mosquitoService.getSubLevelLabel(index.mosquitoIndex),
    }));

    return {
      updatedAt: updatedAt?.toISOString() ?? null,
      ranking: limit ? ranking.slice(0, limit) : ranking,
    };
  }
}