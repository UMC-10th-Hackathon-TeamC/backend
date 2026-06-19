// 기존 데이터 타입
export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

// TSOA를 위한 명시적 응답 인터페이스 (제네릭 제거)
export interface AuthResponseDto {
  success: boolean;
  statusCode: number;
  message: string;
  data: TokenData | null;
}

// 로그아웃 등을 위한 공통 응답 인터페이스 (데이터가 null일 때)
export interface AuthNullResponseDto {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}