import { Controller, Post, Route, Tags, Example } from "tsoa";
import { MosquitoService } from "../service/mosquito.service";
import { ApiResponse, successResponse } from "../../../common/responses/response";
import { DailyRefreshResult } from "../dto/mosquito.dto";

const mosquitoService = new MosquitoService();

@Route("mosquito")
@Tags("Mosquito")
export class MosquitoController extends Controller {
/**
 * 전체 자치구의 모기지수를 갱신합니다.
 *
 * @summary 모기지수 수동 갱신
 */
  @Post("refresh")
  @Example<ApiResponse<DailyRefreshResult[]>>({
    success: true,
    statusCode: 200,
    message: "모기지수 갱신 완료",
    data: [
      { districtName: "강남구", success: true, mosquitoIndex: 91.7, level: 4 },
      { districtName: "종로구", success: false, errorMessage: "TMN 없음" },
    ],
  })
  public async refresh(): Promise<ApiResponse<DailyRefreshResult[]>> {
    const results = await mosquitoService.runDailyRefresh();
    return successResponse(200, "모기지수 갱신 완료", results);
  }
}
