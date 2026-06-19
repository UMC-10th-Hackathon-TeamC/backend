import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { RegisterRoutes } from "./generated/routes";
import { errorHandler } from "./common/errors/error";
import swaggerAutogen from "swagger-autogen";
import swaggerUiExpress from "swagger-ui-express";

// 1. 환경 변수 설정
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// 2. 미들웨어 설정
app.use(cors());                             
app.use(express.static('public'));            
app.use(express.json());                      
app.use(express.urlencoded({ extended: false })); 
app.use(
  "/docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup({}, {
    swaggerOptions: {
      url: "/openapi.json",
    },
  })
);

app.get("/openapi.json", async (req, res, next) => {
  // #swagger.ignore = true
  const options = {
    openapi: "3.0.0",
    disableLogs: true,
    writeOutputFile: false,
  };
  const outputFile = "/dev/null"; // 파일 출력은 사용하지 않습니다.
  const routes = ["./src/index.js"];
  const doc = {
    info: {
      title: "UMC 9th",
      description: "UMC 9th Node.js 테스트 프로젝트입니다.",
    },
    host: "localhost:3000",
  };

  const result = await swaggerAutogen(options)(outputFile, routes, doc);
  res.json(result ? result.data : null);
});


// 3. 기본 라우트
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! This is TypeScript Server!");
});

// tsoa가 생성한 컨트롤러 라우트 등록
RegisterRoutes(app);

// 5. 에러 핸들링 미들웨어 (라우트 등록 이후, 가장 마지막에 위치)
app.use(errorHandler);

// 6. 서버 시작
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
