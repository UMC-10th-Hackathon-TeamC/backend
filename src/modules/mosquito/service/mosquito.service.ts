import { MosquitoRepository } from "../repository/mosquito.repository";
import { DailyRefreshResult } from "../dto/mosquito.dto";
import {
  AUTH_KEY,
  DISTRICTS,
  dateKeyToDate,
  extractDailyAverage,
  extractTMN,
  fetchVilageFcst,
  getDailyWeatherSeriesFromCsv,
  getLatestBaseDateTime,
} from "../mosquito.util";

const LEVEL_LABELS: Record<number, string> = {
  1: "관심",
  2: "주의",
  3: "경보",
  4: "위험",
};

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export class MosquitoService {
  constructor(private readonly mosquitoRepository = new MosquitoRepository()) {}

  calcMosquitoIndex(avgTemp: number, avgHum: number, minTemp: number): number {
    const t = avgTemp,
      h = avgHum / 100,
      tn = minTemp;
    return Math.exp(6.368 - 0.031 * t - 3.25 * h - 0.215 * tn + 0.001 * t * t + 4.024 * h * h + 0.006 * tn * tn);
  }

  getAlertLevel(value: number): number {
    if (value < 25) return 1;
    if (value < 50) return 2;
    if (value < 75) return 3;
    return 4;
  }

  getLevelLabel(level: number): string {
    return LEVEL_LABELS[level];
  }

  async ensureTodayData(): Promise<void> {
    const exists = await this.mosquitoRepository.existsForDate(startOfToday());
    if (!exists) {
      await this.runDailyRefresh();
    }
  }

  async runDailyRefresh(): Promise<DailyRefreshResult[]> {
    const { baseDate, baseTime } = getLatestBaseDateTime();
    const today = startOfToday();
    const results: DailyRefreshResult[] = [];

    for (const d of DISTRICTS) {
      try {
        const district = await this.mosquitoRepository.upsertDistrict({
          name: d.gu,
          latitude: d.latitude,
          longitude: d.longitude,
          nx: d.nx,
          ny: d.ny,
        });

        // 처음 보는 구라면 CSV의 과거 14일치를 DailyWeather에 1회 백필
        const hasHistory = (await this.mosquitoRepository.countDailyWeather(district.id)) > 0;
        if (!hasHistory) {
          const series = getDailyWeatherSeriesFromCsv(d.dong);
          if (series) {
            for (const entry of series) {
              await this.mosquitoRepository.upsertDailyWeather({
                districtId: district.id,
                date: dateKeyToDate(entry.dateKey),
                avgTemp: entry.avgTemp,
                avgHum: entry.avgHum,
              });
            }
          }
        }

        const json = await fetchVilageFcst(baseDate, baseTime, d.nx, d.ny, AUTH_KEY);
        const minTemp = extractTMN(json);
        if (minTemp === null) {
          results.push({ districtName: d.gu, success: false, errorMessage: "TMN 없음" });
          continue;
        }

        // 오늘 하루치 평균 기온/습도를 DailyWeather에 적재 (이동평균이 매일 갱신되도록)
        const todayAvgTemp = extractDailyAverage(json, "T1H", baseDate);
        const todayAvgHum = extractDailyAverage(json, "REH", baseDate);
        if (todayAvgTemp !== null && todayAvgHum !== null) {
          await this.mosquitoRepository.upsertDailyWeather({
            districtId: district.id,
            date: today,
            avgTemp: todayAvgTemp,
            avgHum: todayAvgHum,
          });
        }

        const recentWeather = await this.mosquitoRepository.findRecentDailyWeather(district.id, 14);
        if (!recentWeather.length) {
          results.push({ districtName: d.gu, success: false, errorMessage: "기온/습도 데이터 없음" });
          continue;
        }
        const compositeTemp = recentWeather.reduce((sum, w) => sum + w.avgTemp, 0) / recentWeather.length;
        const compositeHum = recentWeather.reduce((sum, w) => sum + w.avgHum, 0) / recentWeather.length;

        const mosquitoIndex = this.calcMosquitoIndex(compositeTemp, compositeHum, minTemp);
        const level = this.getAlertLevel(mosquitoIndex);

        await this.mosquitoRepository.upsertDaily({
          districtId: district.id,
          date: today,
          mosquitoIndex,
          level,
          compositeTemp,
          compositeHum,
          minTemp,
        });

        results.push({ districtName: d.gu, success: true, mosquitoIndex, level });
        await new Promise((r) => setTimeout(r, 150));
      } catch (e: any) {
        results.push({ districtName: d.gu, success: false, errorMessage: e.message });
      }
    }

    return results;
  }
}
