/**
 * 유저 프로필 조회 응답 데이터
 */
export interface UserProfileData {
  /** @example 1 */
  id: number;
  /** @example "user@example.com" */
  email: string;
  /** @example "귀염둥이개발자" */
  nickname: string;
  /** @example "https://example.com/profile.jpg" */
  profileImage: string | null;
  /** @example "2026-06-20T16:00:00.000Z" */
  createdAt: Date;
}

/**
 * 닉네임 수정 요청 데이터
 */
export interface UpdateNicknameRequest {
  /** * 변경할 새로운 닉네임 
   * @example "새로운닉네임" 
   */
  nickname: string;
}

/**
 * 닉네임 수정 응답 데이터
 */
export interface UpdateNicknameData {
  /** @example 1 */
  id: number;
  /** @example "새로운닉네임" */
  nickname: string;
}

/**
 * GPS 기반 자치구 조회 응답 데이터
 */
export interface DistrictInfoData {
  /** * 자치구 고유 식별자 
   * @example 5 
   */
  id: number;
  /** * 자치구 이름 
   * @example "성남시 분당구" 
   */
  name: string;
  /** * 현재 모기 지수 
   * @example 3.5 
   */
  mosquitoIndex: number;
  /** * 모기 지수 위험도 레벨 
   * @example "높음" 
   */
  level: string;
}