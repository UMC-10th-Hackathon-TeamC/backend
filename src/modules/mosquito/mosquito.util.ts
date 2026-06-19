import fs from "fs";
import path from "path";
import https from "https";

export const AUTH_KEY = "EO2rn50VQbOtq5-dFWGzcA";
export const CSV_DIR = "./weather.csv";
export const COMPOSITE_DAYS = 14;

export const DISTRICTS = [
  { gu: "종로구", dong: "사직동", nx: 60, ny: 127, latitude: 37.5734684, longitude: 126.978984 },
  { gu: "중구", dong: "명동", nx: 60, ny: 127, latitude: 37.5637584, longitude: 126.9975517 },
  { gu: "용산구", dong: "용산2가동", nx: 60, ny: 126, latitude: 37.5323264, longitude: 126.9907031 },
  { gu: "성동구", dong: "행당제1동", nx: 61, ny: 127, latitude: 37.5634092, longitude: 127.0369449 },
  { gu: "광진구", dong: "자양제1동", nx: 62, ny: 126, latitude: 37.5362767, longitude: 127.0876506 },
  { gu: "동대문구", dong: "용두동", nx: 61, ny: 127, latitude: 37.5742015, longitude: 127.0398327 },
  { gu: "중랑구", dong: "면목본동", nx: 62, ny: 128, latitude: 37.6063046, longitude: 127.0931523 },
  { gu: "성북구", dong: "성북동", nx: 61, ny: 127, latitude: 37.589366, longitude: 127.017343 },
  { gu: "강북구", dong: "번1동", nx: 61, ny: 128, latitude: 37.6397767, longitude: 127.0255184 },
  { gu: "도봉구", dong: "도봉제1동", nx: 61, ny: 129, latitude: 37.6687735, longitude: 127.047071 },
  { gu: "노원구", dong: "중계본동", nx: 61, ny: 129, latitude: 37.6540782, longitude: 127.0566045 },
  { gu: "은평구", dong: "불광제1동", nx: 59, ny: 127, latitude: 37.602749, longitude: 126.929256 },
  { gu: "서대문구", dong: "북아현동", nx: 59, ny: 127, latitude: 37.5792607, longitude: 126.9364946 },
  { gu: "마포구", dong: "공덕동", nx: 59, ny: 127, latitude: 37.566242, longitude: 126.9019425 },
  { gu: "양천구", dong: "신정1동", nx: 58, ny: 126, latitude: 37.5169508, longitude: 126.8665644 },
  { gu: "강서구", dong: "화곡본동", nx: 58, ny: 126, latitude: 37.5509103, longitude: 126.8495742 },
  { gu: "구로구", dong: "구로제1동", nx: 58, ny: 125, latitude: 37.4954703, longitude: 126.8876391 },
  { gu: "금천구", dong: "시흥제1동", nx: 59, ny: 124, latitude: 37.4567667, longitude: 126.8954005 },
  { gu: "영등포구", dong: "영등포동", nx: 58, ny: 126, latitude: 37.5262625, longitude: 126.8959528 },
  { gu: "동작구", dong: "사당제1동", nx: 59, ny: 125, latitude: 37.5124298, longitude: 126.9397997 },
  { gu: "관악구", dong: "청룡동", nx: 59, ny: 125, latitude: 37.4782605, longitude: 126.9515208 },
  { gu: "서초구", dong: "서초1동", nx: 61, ny: 125, latitude: 37.4836379, longitude: 127.0326416 },
  { gu: "강남구", dong: "역삼1동", nx: 61, ny: 126, latitude: 37.5175686, longitude: 127.0474869 },
  { gu: "송파구", dong: "잠실본동", nx: 62, ny: 126, latitude: 37.5144533, longitude: 127.1059047 },
  { gu: "강동구", dong: "성내제1동", nx: 62, ny: 126, latitude: 37.530122, longitude: 127.1237479 },
];

// ---- CSV 파싱 ----
function findCsvFile(dong: string, keyword: string): string | null {
  if (!fs.existsSync(CSV_DIR)) return null;
  const files = fs.readdirSync(CSV_DIR);
  const target = files.find((f) => f.startsWith(`${dong}_${keyword}_`) && f.endsWith(".csv"));
  return target ? path.join(CSV_DIR, target) : null;
}

function parseWeatherCsv(filepath: string) {
  const content = fs.readFileSync(filepath, "utf-8");
  const lines = content.split("\n");
  let currentDate: string | null = null;
  const records: { baseDate: string; baseHour: number; forecast: number; value: number }[] = [];

  const firstMatch = lines[0].match(/Start\s*:\s*(\d{8})/);
  if (firstMatch) currentDate = firstMatch[1];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const startMatch = line.match(/Start\s*:\s*(\d{8})/);
    if (startMatch) {
      currentDate = startMatch[1];
      continue;
    }

    const parts = line.split(",");
    if (parts.length === 4 && currentDate) {
      const baseHour = (parseInt(parts[1].trim(), 10) / 100) | 0;
      const forecast = parseInt(parts[2].trim().replace("+", ""), 10);
      const value = parseFloat(parts[3].trim());
      if (!isNaN(value)) records.push({ baseDate: currentDate, baseHour, forecast, value });
    }
  }
  return records;
}

function toActualDate(baseDateStr: string, baseHour: number, forecast: number) {
  const y = parseInt(baseDateStr.slice(0, 4), 10);
  const m = parseInt(baseDateStr.slice(4, 6), 10) - 1;
  const d = parseInt(baseDateStr.slice(6, 8), 10);
  const dt = new Date(y, m, d, baseHour);
  dt.setHours(dt.getHours() + forecast);
  return dt;
}

function buildDailyAverage(records: ReturnType<typeof parseWeatherCsv>) {
  const best = new Map<string, { forecast: number; value: number; date: Date }>();
  for (const r of records) {
    const actualDt = toActualDate(r.baseDate, r.baseHour, r.forecast);
    const key = actualDt.toISOString();
    const existing = best.get(key);
    if (!existing || r.forecast < existing.forecast) {
      best.set(key, { forecast: r.forecast, value: r.value, date: actualDt });
    }
  }
  const daily = new Map<string, number[]>();
  for (const { value, date } of best.values()) {
    const dateKey = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    if (!daily.has(dateKey)) daily.set(dateKey, []);
    daily.get(dateKey)!.push(value);
  }
  const result: Record<string, number> = {};
  for (const [date, values] of daily.entries()) {
    result[date] = values.reduce((a, b) => a + b, 0) / values.length;
  }
  return result;
}

// CSV에 들어있는 일별 평균기온/평균습도를 날짜순으로 반환 (DailyWeather 백필용)
export function getDailyWeatherSeriesFromCsv(
  dong: string
): { dateKey: string; avgTemp: number; avgHum: number }[] | null {
  const tempFile = findCsvFile(dong, "1시간기온");
  const humFile = findCsvFile(dong, "습도");
  if (!tempFile || !humFile) return null;

  const dailyTemp = buildDailyAverage(parseWeatherCsv(tempFile));
  const dailyHum = buildDailyAverage(parseWeatherCsv(humFile));

  const dateKeys = Object.keys(dailyTemp)
    .filter((dateKey) => dateKey in dailyHum)
    .sort();

  return dateKeys.map((dateKey) => ({
    dateKey,
    avgTemp: dailyTemp[dateKey],
    avgHum: dailyHum[dateKey],
  }));
}

export function dateKeyToDate(dateKey: string): Date {
  const y = parseInt(dateKey.slice(0, 4), 10);
  const m = parseInt(dateKey.slice(4, 6), 10) - 1;
  const d = parseInt(dateKey.slice(6, 8), 10);
  return new Date(y, m, d);
}

// ---- getVilageFcst 최저기온 조회 ----
export function fetchVilageFcst(baseDate: string, baseTime: string, nx: number, ny: number, authKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst?pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}&authKey=${authKey}`;
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("JSON 파싱 실패: " + data.slice(0, 200)));
          }
        });
      })
      .on("error", reject);
  });
}

export function extractTMN(json: any): number | null {
  try {
    const items = json.response.body.items.item;
    const tmnItem = items.find((it: any) => it.category === "TMN");
    return tmnItem ? parseFloat(tmnItem.fcstValue) : null;
  } catch (e) {
    return null;
  }
}

// 오늘(fcstDate) 하루치 T1H(기온)/REH(습도) 예보값 평균 — DailyWeather 일일 적재용
export function extractDailyAverage(json: any, category: "T1H" | "REH", fcstDate: string): number | null {
  try {
    const items = json.response.body.items.item;
    const values = items
      .filter((it: any) => it.category === category && it.fcstDate === fcstDate)
      .map((it: any) => parseFloat(it.fcstValue));
    if (!values.length) return null;
    return values.reduce((a: number, b: number) => a + b, 0) / values.length;
  } catch (e) {
    return null;
  }
}

export function getLatestBaseDateTime() {
  const now = new Date();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  const hour = now.getHours();
  const date = new Date(now);
  let chosen: number | null = null;

  for (let i = baseTimes.length - 1; i >= 0; i--) {
    if (hour >= baseTimes[i] + 1) {
      chosen = baseTimes[i];
      break;
    }
  }
  if (chosen === null) {
    date.setDate(date.getDate() - 1);
    chosen = 23;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return { baseDate: `${y}${m}${d}`, baseTime: `${String(chosen).padStart(2, "0")}00` };
}
