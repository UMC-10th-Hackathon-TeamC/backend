import { Body, Controller, Get, Middlewares, Post, Route, Security, Tags, Request, Example, Response } from 'tsoa';
import passport from '../../../auth.config';
import { AuthNullResponseDto } from '../dto/auth.dto';
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
  @Middlewares(passport.authenticate("google", { session: false, scope: ["email", "profile"] }))
  public async googleLogin(): Promise<void> {
    // 실제 인증 처리는 passport GoogleStrategy가 수행함
  }

  /**
   * 구글 로그인 콜백 처리
   * - TSOA 빌드 에러 방지를 위해 @Res() 대신 req.res 사용
   * @summary 구글 로그인 콜백
   */
  @Get("callback/google")
  @Response(401, "인증 실패")
  public async googleCallback(@Request() req: any): Promise<void> {
    // 1. Passport 인증 수행 (Promise로 래핑)
    const user = await new Promise<any>((resolve, reject) => {
      passport.authenticate("google", { session: false }, (err, user, info) => {
        if (err) return reject(new AppError(500, err.message));
        if (!user) return reject(new AppError(401, info?.message || "인증 실패"));
        resolve(user);
      })(req, req.res);
    });

    // 2. 토큰 및 리프레시 토큰 로직
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken }
    });

    // 3. 앱으로 리다이렉트
    const redirectUrl = `mogi://oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    req.res.redirect(redirectUrl);
  }
}

/**
 * 로그인/로그아웃 등 인증 관리
 */
@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {

  /**
   * [개발용] 로컬 테스트 토큰 생성 API
   * @summary 로컬 테스트용 토큰 발급
   * @description 운영 환경에서는 사용이 차단된 개발자 전용 API입니다. userId를 입력하여 테스트용 JWT를 받습니다.
   * @param body { userId: number } - 테스트에 사용할 사용자 ID
   * @example body { "userId": 1 }
   */
  @Post("local/token")
  @Example<{ token: string }>({
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @Response(403, "운영 환경에서는 사용할 수 없습니다.")
  public async getLocalToken(@Body() body: { userId: number }): Promise<{ token: string }> {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError(403, "운영 환경에서는 사용할 수 없습니다.");
    }
    const token = generateAccessToken({ id: body.userId } as any);
    return { token };
  }

  /**
   * 로그아웃 처리
   * @summary 로그아웃
   */
  @Security("jwt")
  @Post("logout")
  @Example<AuthNullResponseDto>({
    success: true,
    statusCode: 200,
    message: "로그아웃 성공",
    data: null,
  })
  @Response<AuthNullResponseDto>(404, "사용자를 찾을 수 없습니다.", {
    success: false,
    statusCode: 404,
    message: "사용자를 찾을 수 없습니다.",
    data: null,
  })
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