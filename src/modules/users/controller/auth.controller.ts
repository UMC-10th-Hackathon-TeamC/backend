import { Controller, Get, Post, Route, Tags, Security, Request } from 'tsoa';
import passport from '../../../auth.config';
import { AuthResponseDto, AuthNullResponseDto } from '../dto/auth.dto';
import { generateAccessToken, generateRefreshToken } from '../../../auth.config';
import { prisma } from '../../../db.config'; // 👈 Prisma 인스턴스 import 필요

@Route("api/auth")
@Tags("Auth")
export class AuthController extends Controller {
  
  @Get("oauth2/login/google")
  public async googleLogin(): Promise<void> {
    // 실제 처리는 passport 미들웨어에서 수행
  }

  @Get("oauth2/callback/google")
public async googleCallback(@Request() req: any): Promise<AuthResponseDto> {
  const user = await new Promise((resolve, reject) => {
    // 세션 false 설정 확인
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) return reject(err);
      if (!user) return reject(new Error(info?.message || "인증 실패")); // info에 상세 에러가 담길 수 있습니다
      resolve(user);
    })(req, req.res, (err: any) => { if (err) reject(err); }); // next 함수 추가
  }) as any;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // [추가] 리프레쉬 토큰을 DB에 저장 (보안을 위해 필수)
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

  @Security("jwt")
  @Post("logout")
  public async logout(@Request() req: any): Promise<AuthNullResponseDto> {
    const user = req.user as any;

    // [추가] 로그아웃 시 DB의 리프레쉬 토큰 무효화
    await prisma.user.update({
      where: { id: user.id },
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