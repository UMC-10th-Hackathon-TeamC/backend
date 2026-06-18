import { Controller, Get, Path, Route } from "tsoa";
import { DistrictService } from "../service/district.service";
import { successResponse } from "../../../common/responses/response";

const districtService = new DistrictService();

@Route("districts")
export class DistrictController extends Controller {
  @Get("{districtId}")
  public async getDistrictById(@Path() districtId: number) {
    const district = await districtService.getDistrictDetail(districtId);
    return successResponse(200, "자치구 상세 조회 성공", district);
  }

  @Get()
  public async getDistricts() {
    const result = await districtService.getDistrictList();
    return successResponse(200, "자치구 목록 조회 성공", result);
  }
}
