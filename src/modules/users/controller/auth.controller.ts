import { Controller, Get, Post, Route, Tags, Security, Request } from 'tsoa';
import passport from '../../../auth.config';
import { AuthResponseDto, AuthNullResponseDto } from '../dto/auth.dto';
import { generateAccessToken, generateRefreshToken, getUserIdFromRequest } from '../../../auth.config';
import { prisma } from '../../../db.config';
import { NotFoundError, AppError } from '../../../common/errors/app.error';

@Route("api/auth")
@Tags("Auth")
export class AuthController extends Controller {

  /**
   * 구글 OAuth2 로그인 페이지로 리다이렉트
   */
  @Get("oauth2/login/google")
  public async googleLogin(): Promise<void> {
    // 실제 인증 처리는 auth.config에 등록된 passport GoogleStrategy가 수행함
  }

  /**
   * 구글 로그인 콜백 처리
   * - 인증 성공 시 토큰 발급 및 DB 리프레쉬 토큰 저장
   */
  @Get("oauth2/callback/google")
  public async googleCallback(@Request() req: any): Promise<AuthResponseDto> {
    // 1. Passport를 사용하여 구글 인증 수행
    const user = await new Promise<any>((resolve, reject) => {
      passport.authenticate("google", { session: false }, (err, user, info) => {
        if (err) return reject(new AppError(500, err.message)); // 서버 오류 시
        if (!user) return reject(new AppError(401, info?.message || "인증 실패")); // 인증 실패 시
        resolve(user);
      })(req, req.res);
    });

    // 2. JWT 액세스 및 리프레쉬 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 3. 보안을 위해 리프레쉬 토큰을 DB에 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken }
    });

    return {
      success: true,
      statusCode: 200,
      message: "로그인 성공",
      data: { accessToken, refreshToken }
    };
  }

  /**
   * 로그아웃 처리
   * - 토큰을 검증하고 DB의 리프레쉬 토큰을 제거하여 세션 무효화
   */
  @Security("jwt")
  @Post("logout")
  public async logout(@Request() req: any): Promise<AuthNullResponseDto> {
    // 1. 공통 유틸 함수로 안전하게 유저 ID 추출 (토큰 기반)
    const userId = getUserIdFromRequest(req);

    // 2. 실제 존재하는 사용자인지 DB 확인
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("사용자를 찾을 수 없습니다.");

    // 3. 로그아웃 수행: DB에서 리프레쉬 토큰을 삭제하여 토큰 탈취 방지
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });

    return {
      success: true,
      statusCode: 200,
      message: "로그아웃 성공",
      data: null
    };
  }
}