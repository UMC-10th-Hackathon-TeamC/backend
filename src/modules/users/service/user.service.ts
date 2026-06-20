import { UserRepository } from '../repository/user.repository';
import { UserProfileData, UpdateNicknameData, DistrictInfoData } from '../dto/user.dto';
import { NotFoundError, AppError } from '../../../common/errors/app.error';

export class UserService {
  private userRepository = new UserRepository();

  /**
   * 유저 프로필 조회
   * - DB에서 조회된 유저 정보를 DTO 형식으로 변환하여 반환
   */
  public async getProfile(userId: number): Promise<UserProfileData> {
    const user = await this.userRepository.findUserById(userId);
    
    // 유저가 없을 경우 404 에러 던지기
    if (!user) throw new NotFoundError("유저를 찾을 수 없습니다.");

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    };
  }

  /**
   * 닉네임 수정
   * - 새로운 닉네임으로 업데이트 후 수정된 데이터 반환
   */
  public async updateNickname(userId: number, nickname: string): Promise<UpdateNicknameData> {
    const updatedUser = await this.userRepository.updateNickname(userId, nickname);
    
    if (!updatedUser) throw new AppError(500, "닉네임 업데이트 중 오류가 발생했습니다.");

    return {
      id: updatedUser.id,
      nickname: updatedUser.nickname,
    };
  }

  /**
   * GPS 기반 현재 위치 자치구 조회
   * - 외부 지오코딩 API 연동을 위한 인터페이스 구조
   */
  public async getDistrictByLocation(latitude: number, longitude: number): Promise<DistrictInfoData> {
    // 실제 환경: 위/경도를 기반으로 역지오코딩 API 호출 후 모기 지수 조회
    
    // 예시 데이터 반환 (테스트용)
    const mockDistrict: DistrictInfoData = {
      id: 1,
      name: "강남구",
      mosquitoIndex: 75,
      level: "높음"
    };

    if (!mockDistrict) throw new NotFoundError("해당 위치의 자치구 정보를 찾을 수 없습니다.");

    return mockDistrict;
  }
}