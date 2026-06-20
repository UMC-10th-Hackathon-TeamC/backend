import { DistrictRepository } from "../repository/district.repository";
import { MosquitoRepository } from "../../mosquito/repository/mosquito.repository";
import { MosquitoService } from "../../mosquito/service/mosquito.service";
import { DistrictDetailDto, DistrictListDto, DistrictListItemDto } from "../dto/district.dto";
import { NotFoundError } from "../../../common/errors/app.error";

const ACTION_GUIDE_RANGES: { max: number; text: string }[] = [
  { max: 8.3, text: "모기 활동이 없는 시기예요. 특별한 대비 없이 평소처럼 지내셔도 좋아요." },
  { max: 16.6, text: "아직은 안심해도 되는 단계예요. 평소처럼 생활하시면 됩니다." },
  { max: 24.9, text: "곧 모기가 늘어날 수 있어요. 창문과 문에 방충망을 미리 점검해 두세요." },
  { max: 33.3, text: "모기가 서서히 활동을 시작해요. 늦은 시간 환기는 자제하고, 집 주변 고인 물을 비워주세요." },
  { max: 41.6, text: "방충망 틈새나 침입 가능한 통로가 없는지 보수해 주세요." },
  { max: 49.9, text: "정화조나 옥상 빗물통 등 물이 고일 수 있는 곳을 점검하고 뚜껑을 덮어주세요." },
  { max: 58.3, text: "출입문과 창문을 열어두는 건 자제하고, 화단이나 그늘진 곳에 모기가 보이면 에어로졸로 방제하세요." },
  { max: 66.6, text: "야외 활동 시 피부 노출을 최소화하고, 침대나 유모차에 모기장을 사용해 주세요." },
  { max: 74.9, text: "저녁 7시 이후엔 문과 창문을 닫아두고, 야외 활동 시 모기기피제를 사용하세요. (어린이는 전용 제품 사용)" },
  { max: 83.3, text: "취침 시 모기장을 사용하고, 야외활동 후엔 바로 샤워해 주세요. 야간 외출 시 기피제는 필수예요." },
  { max: 91.6, text: "모기가 보이면 즉시 방제하고, 일상 속 모기 발생원을 적극적으로 제거해 주세요." },
  { max: Infinity, text: "야외활동은 최대한 자제하고, 집 주변 고인 물을 확인해 보건소에 적극 신고해 주세요." },
];

function getActionGuide(mosquitoIndex: number): string {
  const range = ACTION_GUIDE_RANGES.find((r) => mosquitoIndex <= r.max);
  return (range ?? ACTION_GUIDE_RANGES[ACTION_GUIDE_RANGES.length - 1]).text;
}

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
        level: this.mosquitoService.getSubLevelLabel(index?.mosquitoIndex ?? 0),
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
    const mosquitoIndex = index?.mosquitoIndex ?? 0;

    return {
      id: district.id,
      name: district.name,
      latitude: district.latitude,
      longitude: district.longitude,
      mosquitoIndex,
      level: this.mosquitoService.getSubLevelLabel(mosquitoIndex),
      description: getActionGuide(mosquitoIndex),
      updatedAt: (index?.createdAt ?? new Date()).toISOString(),
    };
  }
}
