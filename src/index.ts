import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { RegisterRoutes } from "./generated/routes";
import { errorHandler } from "./common/errors/error";
import passport from "passport"; 
// 1. Passport 설정 파일 불러오기 (전략들이 등록됨)
import "./auth.config"; 

// 2. 환경 변수 설정
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// 3. 미들웨어 설정
app.use(cors());                             
app.use(express.static('public'));            
app.use(express.json());                      
app.use(express.urlencoded({ extended: false })); 

// 4. Passport 초기화 (Passport 미들웨어 등록)
app.use(passport.initialize());

// 5. 기본 라우트
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! This is TypeScript Server!");
});

// 6. TSOA가 생성한 컨트롤러 라우트 등록
RegisterRoutes(app);

// 7. 에러 핸들링 미들웨어 (가장 마지막에 위치)
app.use(errorHandler);



// 8. 서버 시작
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});