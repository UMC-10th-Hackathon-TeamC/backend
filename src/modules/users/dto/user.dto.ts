export interface UserProfileData {
  id: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  createdAt: Date;
}

export interface UpdateNicknameRequest {
  nickname: string;
}

export interface UpdateNicknameData {
  id: number;
  nickname: string;
}

export interface DistrictInfoData {
  id: number;
  name: string;
  mosquitoIndex: number;
  level: string; // 예: "높음"
}