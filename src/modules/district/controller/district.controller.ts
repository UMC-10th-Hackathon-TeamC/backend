import { Controller, Get, Path, Response, Route, Tags, Example } from "tsoa";
import { DistrictService } from "../service/district.service";
import { ApiResponse, successResponse } from "../../../common/responses/response";
import { DistrictDetailDto, DistrictListDto } from "../dto/district.dto";

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
  @Example<ApiResponse<DistrictDetailDto>>({
    success: true,
    statusCode: 200,
    message: "자치구 상세 조회 성공",
    data: {
      id: 1,
      name: "강남구",
      latitude: 37.5172,
      longitude: 127.0473,
      mosquitoIndex: 91.7,
      level: "위험(상)",
      description: "야외활동은 최대한 자제하고, 집 주변 고인 물을 확인해 보건소에 적극 신고해 주세요.",
      updatedAt: "2026-06-21T00:00:00.000Z",
    },
  })
  @Response<ApiResponse<null>>(404, "존재하지 않는 자치구입니다.", {
    success: false,
    statusCode: 404,
    message: "존재하지 않는 자치구입니다.",
    data: null,
  })
  public async getDistrictById(@Path() districtId: number): Promise<ApiResponse<DistrictDetailDto>> {
    const district = await districtService.getDistrictDetail(districtId);
    return successResponse(200, "자치구 상세 조회 성공", district);
  }
/**
 * 지도 화면에 표시할 전체 자치구 목록과 모기지수 정보를 조회합니다.
 *
 * @summary 전체 자치구 목록 조회
 */
  @Get()
  @Example<ApiResponse<DistrictListDto>>({
    success: true,
    statusCode: 200,
    message: "자치구 목록 조회 성공",
    data: {
      districts: [
        {
          id: 1,
          name: "강남구",
          latitude: 37.5172,
          longitude: 127.0473,
          mosquitoIndex: 91.7,
          level: "위험(상)",
        },
        {
          id: 2,
          name: "강동구",
          latitude: 37.5301,
          longitude: 127.1238,
          mosquitoIndex: 42.3,
          level: "주의(중)",
        },
      ],
    },
  })
  public async getDistricts(): Promise<ApiResponse<DistrictListDto>> {
    const result = await districtService.getDistrictList();
    return successResponse(200, "자치구 목록 조회 성공", result);
  }
}
