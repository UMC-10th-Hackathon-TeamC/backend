import { Controller, Get, Patch, Route, Tags, Request, Body, Security, Query } from 'tsoa';
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
   * 내 프로필 정보 조회
   * - JWT 토큰의 유저 ID를 추출하여 프로필 정보를 조회합니다.
   */
  @Security("jwt")
  @Get("me")
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
   * 닉네임 수정
   * - 전달받은 닉네임으로 유저 데이터를 업데이트합니다.
   */
  @Security("jwt")
  @Patch("me")
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
   * GPS 기반 현재 위치 자치구 조회
   * - 위도/경도 정보를 바탕으로 해당 위치의 자치구 정보를 조회합니다.
   */
  @Security("jwt")
  @Get("me/district")
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