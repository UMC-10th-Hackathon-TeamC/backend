import { RankingRepository } from "../repository/ranking.repository";
import { RankingItemDto, RankingResponseDto } from "../dto/ranking.dto";
import { MosquitoService } from "../../mosquito/service/mosquito.service";
import { AppError } from "../../../common/errors/app.error";

const MAX_RANKING_LIMIT = 25;

export class RankingService {
  constructor(
    private readonly rankingRepository = new RankingRepository(),
    private readonly mosquitoService = new MosquitoService()
  ) {}

  async getDistrictRanking(limit?: number): Promise<RankingResponseDto> {
    const validatedLimit = this.validateLimit(limit);

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
      level: this.mosquitoService.getSubLevelLabel(index.level) ?? "알 수 없음",
    }));

    return {
      updatedAt: updatedAt?.toISOString() ?? null,
      ranking: validatedLimit ? ranking.slice(0, validatedLimit) : ranking,
    };
  }

  private validateLimit(limit?: number): number | undefined {
    if (limit === undefined) {
      return undefined;
    }

    if (!Number.isInteger(limit)) {
      throw new AppError(400, "limit은 정수여야 합니다.");
    }

    if (limit < 1 || limit > MAX_RANKING_LIMIT) {
      throw new AppError(400, `limit은 1 이상 ${MAX_RANKING_LIMIT} 이하로 입력해야 합니다.`);
    }

    return limit;
  }
}