import { Controller, Get, Patch, Route, Tags, Request, Body, Security, Query } from 'tsoa';
import { ApiResponse } from '../../../common/responses/response.js';
import { UserService } from '../service/user.service';
import { UserProfileData, UpdateNicknameRequest, UpdateNicknameData, DistrictInfoData } from '../dto/user.dto';

@Route("api/users")
@Tags("User")
export class UserController extends Controller {
  private userService = new UserService();

  /**
   * 프로필 정보 조회
   */
  @Security("jwt")
  @Get("me")
  public async getMyProfile(@Request() req: any): Promise<ApiResponse<UserProfileData>> {
    const userId = req.user.id; 
    const profile = await this.userService.getProfile(userId);
    
    return {
      success: true,
      statusCode: 200,
      message: "프로필 조회 성공",
      data: profile
    };
  }

  /**
   * 닉네임 수정
   */
  @Security("jwt")
  @Patch("me")
  public async updateMyNickname(
    @Request() req: any, 
    @Body() body: UpdateNicknameRequest
  ): Promise<ApiResponse<UpdateNicknameData>> {
    const userId = req.user.id;
    const updatedData = await this.userService.updateNickname(userId, body.nickname);

    return {
      success: true,
      statusCode: 200,
      message: "닉네임 수정 성공",
      data: updatedData
    };
  }

  /**
   * GPS 기반 현재 위치 자치구 조회
   */
  @Security("jwt")
  @Get("me/district")
  public async getMyDistrict(
    @Request() req: any,
    @Query() latitude: number,
    @Query() longitude: number
  ): Promise<ApiResponse<DistrictInfoData>> {
    
    const districtData = await this.userService.getDistrictByLocation(latitude, longitude);

    return {
      success: true,
      statusCode: 200,
      message: "자치구 조회 성공",
      data: districtData
    };
  }
}