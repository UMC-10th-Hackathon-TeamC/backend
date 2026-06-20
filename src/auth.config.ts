import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import jwt from "jsonwebtoken";
import { prisma } from "./db.config.js";
import * as express from "express";

dotenv.config();

// ==========================================
// 1. JWT 및 인증 유틸리티
// ==========================================

export const generateAccessToken = (user: { id: number; email: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
};

export const generateRefreshToken = (user: { id: number }) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: "14d" }
  );
};

/**
 * 요청 객체에서 유저 ID를 안전하게 추출
 */
export const getUserIdFromRequest = (req: any): number => {
  const user = req.user as { id: number } | undefined;
  if (!user || !user.id) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  return user.id;
};

// ==========================================
// 2. Google OAuth 로직
// ==========================================

const googleVerify = async (profile: Profile) => {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new Error("Google 프로필에 이메일이 없습니다.");

  let user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        nickname: profile.displayName || "Unknown",
      },
    });
  }
  return { id: user.id, email: user.email, nickname: user.nickname };
};

// ==========================================
// 3. Passport 전략 설정
// ==========================================

// Google Strategy
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET!,
      // 여기서 환경 변수를 사용하도록 변경합니다!
      // src/auth.config.ts
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/oauth2/callback/google",
      scope: ["email", "profile"],
    },
    async (_accessToken, _refreshToken, profile, cb) => {
      try {
        const user = await googleVerify(profile);
        return cb(null, user);
      } catch (err) {
        return cb(err as Error);
      }
    }
  )
);

// JWT Strategy
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: payload.id } });
        return user ? done(null, user) : done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Passport 세션 규격 (세션 미사용 시에도 필수)
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ==========================================
// 4. TSOA 인증 미들웨어
// ==========================================

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    return new Promise((resolve, reject) => {
      passport.authenticate("jwt", { session: false }, (err: any, user: any, info: any) => {
        if (err) return reject(err);
        
        // 1. 여기서 인증 실패 시 상세 로그 확인
        if (info) console.log("Passport Auth Info:", info);
        if (!user) return reject(new Error("토큰이 유효하지 않습니다."));

        // 2. 중요: TSOA 인증 성공 시 request.user에 유저 정보를 명시적으로 저장
        request.user = user; 
        
        // 3. resolve를 통해 성공 처리
        resolve(user);
      })(request, request.res);
    });
  }
  return Promise.reject(new Error("알 수 없는 보안 전략입니다."));
}

export default passport;