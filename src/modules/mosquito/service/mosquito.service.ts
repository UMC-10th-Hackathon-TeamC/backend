import { MosquitoRepository } from "../repository/mosquito.repository";
import { DailyRefreshResult } from "../dto/mosquito.dto";
import { AUTH_KEY, DISTRICTS, extractTMN, fetchVilageFcst, getCompositeForDistrict, getLatestBaseDateTime } from "../mosquito.util";

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
      const composite = getCompositeForDistrict(d.dong);
      if (!composite) {
        results.push({ districtName: d.gu, success: false, errorMessage: "CSV 없음/파싱 실패" });
        continue;
      }

      try {
        const json = await fetchVilageFcst(baseDate, baseTime, d.nx, d.ny, AUTH_KEY);
        const minTemp = extractTMN(json);
        if (minTemp === null) {
          results.push({ districtName: d.gu, success: false, errorMessage: "TMN 없음" });
          continue;
        }

        const mosquitoIndex = this.calcMosquitoIndex(composite.compositeTemp, composite.compositeHum, minTemp);
        const level = this.getAlertLevel(mosquitoIndex);

        const district = await this.mosquitoRepository.upsertDistrict({
          name: d.gu,
          latitude: d.latitude,
          longitude: d.longitude,
        });

        await this.mosquitoRepository.upsertDaily({
          districtId: district.id,
          date: today,
          mosquitoIndex,
          level,
          compositeTemp: composite.compositeTemp,
          compositeHum: composite.compositeHum,
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
