import { DistrictRepository } from "../repository/district.repository";
import { MosquitoRepository } from "../../mosquito/repository/mosquito.repository";
import { MosquitoService } from "../../mosquito/service/mosquito.service";
import { DistrictDetailDto, DistrictListDto, DistrictListItemDto } from "../dto/district.dto";
import { NotFoundError } from "../../../common/errors/app.error";

const ACTION_GUIDES: Record<number, string> = {
  1: "모기 활동이 적은 편입니다. 야외 활동에 큰 제약은 없습니다.",
  2: "모기 활동이 증가하고 있습니다. 야외 활동 시 모기 기피제 사용을 권장합니다.",
  3: "야외 활동 시 모기 기피제를 사용하세요.",
  4: "모기 활동이 매우 활발합니다. 야외 활동을 자제하고, 외출 시 긴 옷과 모기 기피제를 사용하세요.",
};

export class DistrictService {
  constructor(
    private readonly districtRepository = new DistrictRepository(),
    private readonly mosquitoRepository = new MosquitoRepository(),
    private readonly mosquitoService = new MosquitoService()
  ) {}

  async getDistrictList(): Promise<DistrictListDto> {
    await this.mosquitoService.ensureTodayData();

    const [districts, indexes] = await Promise.all([
      this.districtRepository.findAll(),
      this.mosquitoRepository.findAllLatest(),
    ]);
    const indexMap = new Map(indexes.map((entry) => [entry.districtId, entry]));

    const items: DistrictListItemDto[] = districts.map((district) => {
      const index = indexMap.get(district.id);
      return {
        id: district.id,
        name: district.name,
        latitude: district.latitude,
        longitude: district.longitude,
        mosquitoIndex: index?.mosquitoIndex ?? 0,
        level: this.mosquitoService.getLevelLabel(index?.level ?? 1),
      };
    });

    return { districts: items };
  }

  async getDistrictDetail(districtId: number): Promise<DistrictDetailDto> {
    await this.mosquitoService.ensureTodayData();

    const district = await this.districtRepository.findById(districtId);
    if (!district) {
      throw new NotFoundError("존재하지 않는 자치구입니다.");
    }
    const index = await this.mosquitoRepository.findLatestByDistrict(districtId);
    const level = index?.level ?? 1;

    return {
      id: district.id,
      name: district.name,
      latitude: district.latitude,
      longitude: district.longitude,
      mosquitoIndex: index?.mosquitoIndex ?? 0,
      level: this.mosquitoService.getLevelLabel(level),
      description: ACTION_GUIDES[level],
      updatedAt: (index?.createdAt ?? new Date()).toISOString(),
    };
  }
}
