import { Controller, Get, Query, Route, Tags, Response, Example } from "tsoa";
import { RankingService } from "../service/ranking.service";
import { ApiResponse, successResponse } from "../../../common/responses/response";
import { RankingResponseDto } from "../dto/ranking.dto";

const rankingService = new RankingService();

@Route("districts")
@Tags("District")
export class RankingController extends Controller {
  /**
   * 모기지수를 기준으로 서울시 자치구 랭킹을 조회합니다.
   *
   * limit 값을 전달하면 상위 N개의 랭킹만 반환합니다.
   *
   * @summary 자치구 모기지수 랭킹 조회
   * @param limit 조회할 랭킹 개수
   */
  @Get("ranking")
  @Example<ApiResponse<RankingResponseDto>>({
    success: true,
    statusCode: 200,
    message: "랭킹 조회 성공",
    data: {
      updatedAt: "2026-06-21T00:00:00.000Z",
      ranking: [
        {
          rank: 1,
          id: 1,
          name: "강남구",
          mosquitoIndex: 95,
          level: "위험",
        },
        {
          rank: 2,
          id: 2,
          name: "송파구",
          mosquitoIndex: 88,
          level: "경보",
        },
      ],
    },
  })
  @Response<ApiResponse<null>>(400, "잘못된 limit 값입니다.", {
    success: false,
    statusCode: 400,
    message: "limit은 1 이상 25 이하로 입력해야 합니다.",
    data: null,
  })
  public async getDistrictRanking(
    @Query() limit?: number
  ): Promise<ApiResponse<RankingResponseDto>> {
    const result = await rankingService.getDistrictRanking(limit);
    return successResponse(200, "랭킹 조회 성공", result);
  }
}