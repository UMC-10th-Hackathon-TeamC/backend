import { Controller, Post, Route, Tags } from "tsoa";
import { MosquitoService } from "../service/mosquito.service";
import { successResponse } from "../../../common/responses/response";

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
  public async refresh() {
    const results = await mosquitoService.runDailyRefresh();
    return successResponse(200, "모기지수 갱신 완료", results);
  }
}
