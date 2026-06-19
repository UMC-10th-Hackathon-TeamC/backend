import { Controller, Get, Post, Route, Tags, Security, Request } from 'tsoa';
import passport from '../../../auth.config';
import { AuthResponseDto, AuthNullResponseDto } from '../dto/auth.dto';
import { generateAccessToken, generateRefreshToken } from '../../../auth.config';

@Route("api/auth")
@Tags("Auth")
export class AuthController extends Controller {
  
  @Get("oauth2/login/google")
  public async googleLogin(): Promise<void> {
    // 실제 처리는 passport 미들웨어에서 수행
  }

  @Get("oauth2/callback/google")
  public async googleCallback(@Request() req: any): Promise<AuthResponseDto> {
    // 1. Passport 인증을 Promise로 감싸서 await로 실행
    const user = await new Promise((resolve, reject) => {
      passport.authenticate("google", { session: false }, (err, user) => {
        if (err || !user) reject(new Error("인증 실패"));
        resolve(user);
      })(req, req.res); // req.res를 직접 전달
    });

    // 2. 인증된 유저 객체로 토큰 생성
    const accessToken = generateAccessToken(user as any);
    const refreshToken = generateRefreshToken(user as any);

    // 3. 기존 시그니처대로 AuthResponseDto 반환
    return {
      success: true,
      statusCode: 200,
      message: "로그인 성공",
      data: {
        accessToken, // 이제 실제 값이 들어갑니다!
        refreshToken
      }
    };
  }

  @Security("jwt")
  @Post("logout") // 경로 명시 (오타 수정: auth/logout -> logout)
  public async logout(@Request() req: any): Promise<AuthNullResponseDto> {
    return {
      success: true,
      statusCode: 200,
      message: "로그아웃 성공",
      data: null
    };
  }
}