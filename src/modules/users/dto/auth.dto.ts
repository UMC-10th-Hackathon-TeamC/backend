/**
 * 로그인 성공 시 클라이언트에게 전달되는 토큰 쌍
 */
export interface TokenData {
  /** * JWT Access Token 
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  accessToken: string;

  /** * JWT Refresh Token 
   * @example "dGVzdC1yZWZyZXNoLXRva2VuLWV4YW1wbGU..."
   */
  refreshToken: string;
}

/**
 * 일반적인 인증 응답 인터페이스
 * - 토큰 데이터가 포함된 성공 응답 규격
 */
export interface AuthResponseDto {
  /** @example true */
  success: boolean;
  /** @example 200 */
  statusCode: number;
  /** @example "로그인 성공" */
  message: string;
  /** 인증 토큰 데이터 */
  data: TokenData | null;
}

/**
 * 데이터가 필요 없는 인증 응답 인터페이스
 * - 로그아웃 등 데이터 반환이 불필요한 경우 사용
 */
export interface AuthNullResponseDto {
  /** @example true */
  success: boolean;
  /** @example 200 */
  statusCode: number;
  /** @example "로그아웃 성공" */
  message: string;
  /** 데이터 없음 */
  data: null;
}