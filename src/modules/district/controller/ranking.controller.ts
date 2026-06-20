import { Controller, Get, Query, Route } from "tsoa";
import { RankingService } from "../service/ranking.service";
import { successResponse } from "../../../common/responses/response";

const rankingService = new RankingService();

@Route("districts")
export class RankingController extends Controller {
  @Get("ranking")
  public async getDistrictRanking(@Query() limit?: number) {
    const result = await rankingService.getDistrictRanking(limit);
    return successResponse(200, "랭킹 조회 성공", result);
  }
}