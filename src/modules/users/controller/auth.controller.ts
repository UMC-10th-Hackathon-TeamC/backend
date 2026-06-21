import { Controller, Get, Post, Route, Tags, Security, Request } from 'tsoa';
import { Response } from 'express'; // Express 타입 추가
import passport from '../../../auth.config';
import { AuthResponseDto, AuthNullResponseDto } from '../dto/auth.dto';
import { generateAccessToken, generateRefreshToken, getUserIdFromRequest } from '../../../auth.config';
import { prisma } from '../../../db.config';
import { NotFoundError, AppError } from '../../../common/errors/app.error';

/**
 * 인증 시작 및 콜백 처리
 */
@Route("oauth2")
@Tags("OAuth2")
export class OAuthController extends Controller {

  /**
   * 구글 OAuth2 로그인 페이지로 리다이렉트합니다.
   * @summary 구글 로그인 요청
   */
  @Get("login/google")
  public async googleLogin(): Promise<void> {
    // 실제 인증 처리는 passport GoogleStrategy가 수행함
  }

  /**
   * 구글 로그인 콜백 처리
   * - 인증 성공 시 토큰 발급 및 DB 리프레쉬 토큰 저장
   * * @summary 구글 로그인 콜백
   */
  @Get("callback/google")
  public async googleCallback(@Request() req: any): Promise<any> {
    // 1. Express의 response 객체 안전하게 추출
    const res: Response = req.res;

    // 2. Passport를 사용하여 구글 인증 수행
    const user = await new Promise<any>((resolve, reject) => {
      passport.authenticate("google", { session: false }, (err, user, info) => {
        if (err) return reject(new AppError(500, err.message));
        if (!user) return reject(new AppError(401, info?.message || "인증 실패"));
        resolve(user);
      })(req, res);
    });

    // 3. JWT 발급 및 DB 업데이트
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken }
    });

    // 4. 플랫폼별 응답 처리 (웹 vs 모바일)
    const platform = req.query.platform; // 호출 시 ?platform=mobile 추가
    
    if (platform === 'mobile') {
      const redirectUrl = `mogi://oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
      return res.redirect(redirectUrl);
    }

    // 웹용 JSON 응답
    return {
      success: true,
      statusCode: 200,
      message: "로그인 성공",
      data: { accessToken, refreshToken }
    };
  }
}

/**
 * 로그인/로그아웃 등 인증 관리
 */
@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {

  /**
   * 로그아웃 처리
   * - 토큰을 검증하고 DB의 리프레쉬 토큰을 제거하여 세션 무효화
   * * @summary 로그아웃
   */
  @Security("jwt")
  @Post("logout")
  public async logout(@Request() req: any): Promise<AuthNullResponseDto> {
    const userId = getUserIdFromRequest(req);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("사용자를 찾을 수 없습니다.");

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