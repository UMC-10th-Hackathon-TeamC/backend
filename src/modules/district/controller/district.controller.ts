import { Controller, Get, Path, Route, Tags } from "tsoa";
import { DistrictService } from "../service/district.service";
import { successResponse } from "../../../common/responses/response";

const districtService = new DistrictService();

@Route("districts")
@Tags("District")
export class DistrictController extends Controller {
  /**
 * 특정 자치구의 모기지수 상세 정보를 조회합니다.
 *
 * @summary 자치구 상세 조회
 * @param districtId 자치구 ID
 */
  @Get("{districtId}")
  public async getDistrictById(@Path() districtId: number) {
    const district = await districtService.getDistrictDetail(districtId);
    return successResponse(200, "자치구 상세 조회 성공", district);
  }
/**
 * 지도 화면에 표시할 전체 자치구 목록과 모기지수 정보를 조회합니다.
 *
 * @summary 전체 자치구 목록 조회
 */
  @Get()
  public async getDistricts() {
    const result = await districtService.getDistrictList();
    return successResponse(200, "자치구 목록 조회 성공", result);
  }
}
