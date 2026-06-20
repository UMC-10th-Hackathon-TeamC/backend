import { Controller, Post, Route } from "tsoa";
import { MosquitoService } from "../service/mosquito.service";
import { successResponse } from "../../../common/responses/response";

const mosquitoService = new MosquitoService();

@Route("mosquito")
export class MosquitoController extends Controller {
  @Post("refresh")
  public async refresh() {
    const results = await mosquitoService.runDailyRefresh();
    return successResponse(200, "모기지수 갱신 완료", results);
  }
}
