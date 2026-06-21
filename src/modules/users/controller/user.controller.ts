import { Controller, Get, Patch, Route, Tags, Request, Body, Security, Query, Example, Response as TsoaResponse } from 'tsoa';
import { ApiResponse } from '../../../common/responses/response.js';
import { UserService } from '../service/user.service';
import { UserProfileData, UpdateNicknameRequest, UpdateNicknameData, DistrictInfoData } from '../dto/user.dto';
import { getUserIdFromRequest } from '../../../auth.config';
import { AppError, NotFoundError } from '../../../common/errors/app.error';

@Route("users")
@Tags("User")
export class UserController extends Controller {
  private userService = new UserService();

/**
 * JWT 토큰의 사용자 ID를 기준으로 내 프로필 정보를 조회합니다.
 *
 * @summary 내 프로필 조회
 */
  @Security("jwt")
  @Get("me")
  @Example<ApiResponse<UserProfileData>>({
    success: true,
    statusCode: 200,
    message: "프로필 조회 성공",
    data: {
      id: 1,
      email: "user@example.com",
      nickname: "귀염둥이개발자",
      profileImage: "https://example.com/profile.jpg",
      createdAt: new Date("2026-06-20T16:00:00.000Z"),
    },
  })
  @TsoaResponse<ApiResponse<null>>(404, "사용자 프로필을 찾을 수 없습니다.", {
    success: false,
    statusCode: 404,
    message: "사용자 프로필을 찾을 수 없습니다.",
    data: null,
  })
  public async getMyProfile(@Request() req: any): Promise<ApiResponse<UserProfileData>> {
    // 1. 유틸리티 함수로 토큰에서 유저 ID를 안전하게 추출
    const userId = getUserIdFromRequest(req); 
    
    // 2. 서비스 계층을 통해 데이터 조회
    const profile = await this.userService.getProfile(userId);
    
    // 3. 데이터가 존재하지 않을 경우 404 예외 발생
    if (!profile) throw new NotFoundError("사용자 프로필을 찾을 수 없습니다.");
    
    return {
      success: true,
      statusCode: 200,
      message: "프로필 조회 성공",
      data: profile
    };
  }

/**
 * 로그인한 사용자의 닉네임을 수정합니다.
 *
 * @summary 닉네임 수정
 */
  @Security("jwt")
  @Patch("me")
  @Example<ApiResponse<UpdateNicknameData>>({
    success: true,
    statusCode: 200,
    message: "닉네임 수정 성공",
    data: { id: 1, nickname: "새로운닉네임" },
  })
  @TsoaResponse<ApiResponse<null>>(400, "변경할 닉네임을 입력해주세요.", {
    success: false,
    statusCode: 400,
    message: "변경할 닉네임을 입력해주세요.",
    data: null,
  })
  public async updateMyNickname(
    @Request() req: any, 
    @Body() body: UpdateNicknameRequest
  ): Promise<ApiResponse<UpdateNicknameData>> {
    const userId = getUserIdFromRequest(req);
    
    // 입력값 검증 (DTO 외 로직 검증)
    if (!body.nickname || body.nickname.trim() === "") {
      throw new AppError(400, "변경할 닉네임을 입력해주세요.");
    }

    const updatedData = await this.userService.updateNickname(userId, body.nickname);
    
    if (!updatedData) throw new AppError(500, "닉네임 수정 중 오류가 발생했습니다.");

    return {
      success: true,
      statusCode: 200,
      message: "닉네임 수정 성공",
      data: updatedData
    };
  }

/**
 * 위도와 경도를 기준으로 현재 위치의 자치구 정보를 조회합니다.
 *
 * @summary 현재 위치 자치구 조회
 * @param latitude 위도
 * @param longitude 경도
 */
  @Security("jwt")
  @Get("me/district")
  @Example<ApiResponse<DistrictInfoData>>({
    success: true,
    statusCode: 200,
    message: "자치구 조회 성공",
    data: {
      id: 5,
      name: "성남시 분당구",
      mosquitoIndex: 3.5,
      level: "높음",
    },
  })
  @TsoaResponse<ApiResponse<null>>(400, "위도와 경도 정보가 필요합니다.", {
    success: false,
    statusCode: 400,
    message: "위도와 경도 정보가 필요합니다.",
    data: null,
  })
  @TsoaResponse<ApiResponse<null>>(404, "해당 위치의 자치구 정보를 찾을 수 없습니다.", {
    success: false,
    statusCode: 404,
    message: "해당 위치의 자치구 정보를 찾을 수 없습니다.",
    data: null,
  })
  public async getMyDistrict(
    @Request() req: any,
    @Query() latitude: number,
    @Query() longitude: number
  ): Promise<ApiResponse<DistrictInfoData>> {
    
    // 파라미터 유효성 검사
    if (latitude == null || longitude == null) {
      throw new AppError(400, "위도와 경도 정보가 필요합니다.");
    }

    const districtData = await this.userService.getDistrictByLocation(latitude, longitude);
    
    if (!districtData) throw new NotFoundError("해당 위치의 자치구 정보를 찾을 수 없습니다.");

    return {
      success: true,
      statusCode: 200,
      message: "자치구 조회 성공",
      data: districtData
    };
  }
}