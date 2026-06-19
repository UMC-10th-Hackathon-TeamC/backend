import { UserRepository } from '../repository/user.repository';
import { UserProfileData, UpdateNicknameData, DistrictInfoData } from '../dto/user.dto';

export class UserService {
  private userRepository = new UserRepository();

  public async getProfile(userId: number): Promise<UserProfileData> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) throw new Error("유저를 찾을 수 없습니다.");

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    };
  }

  public async updateNickname(userId: number, nickname: string): Promise<UpdateNicknameData> {
    const updatedUser = await this.userRepository.updateNickname(userId, nickname);
    return {
      id: updatedUser.id,
      nickname: updatedUser.nickname,
    };
  }

  public async getDistrictByLocation(latitude: number, longitude: number): Promise<DistrictInfoData> {
    // 실제 환경: 위/경도를 기반으로 카카오/네이버 로컬 API 역지오코딩을 호출하여
    // 행정구명을 알아낸 뒤, DB의 District 테이블에서 해당 구의 모기 지수를 가져옵니다.
    
    // 해커톤용 Mock Data 반환 (연동 테스트용)
    return {
      id: 1,
      name: "강남구",
      mosquitoIndex: 75,
      level: "높음"
    };
  }
}