import { prisma } from "../../../db.config";
import { DailyWeather, District, MosquitoIndex } from "../../../generated/prisma/client";

export class MosquitoRepository {
  async findLatestByDistrict(districtId: number): Promise<MosquitoIndex | null> {
    return prisma.mosquitoIndex.findFirst({
      where: { districtId },
      orderBy: { date: "desc" },
    });
  }

  async findAllLatest(): Promise<MosquitoIndex[]> {
    const rows = await prisma.mosquitoIndex.findMany({ orderBy: { date: "desc" } });
    const latestByDistrict = new Map<number, MosquitoIndex>();
    for (const row of rows) {
      if (!latestByDistrict.has(row.districtId)) latestByDistrict.set(row.districtId, row);
    }
    return Array.from(latestByDistrict.values());
  }

  async existsForDate(date: Date): Promise<boolean> {
    const count = await prisma.mosquitoIndex.count({ where: { date } });
    return count > 0;
  }

  async upsertDaily(input: {
    districtId: number;
    date: Date;
    mosquitoIndex: number;
    level: number;
    compositeTemp: number;
    compositeHum: number;
    minTemp: number;
  }): Promise<MosquitoIndex> {
    const { districtId, date, ...rest } = input;
    return prisma.mosquitoIndex.upsert({
      where: { districtId_date: { districtId, date } },
      update: rest,
      create: { districtId, date, ...rest },
    });
  }

  async upsertDistrict(input: { name: string; latitude: number; longitude: number }): Promise<District> {
    return prisma.district.upsert({
      where: { name: input.name },
      update: { latitude: input.latitude, longitude: input.longitude },
      create: input,
    });
  }

  async countDailyWeather(districtId: number): Promise<number> {
    return prisma.dailyWeather.count({ where: { districtId } });
  }

  async findRecentDailyWeather(districtId: number, limit = 14): Promise<DailyWeather[]> {
    return prisma.dailyWeather.findMany({
      where: { districtId },
      orderBy: { date: "desc" },
      take: limit,
    });
  }

  async upsertDailyWeather(input: {
    districtId: number;
    date: Date;
    avgTemp: number;
    avgHum: number;
  }): Promise<DailyWeather> {
    const { districtId, date, ...rest } = input;
    return prisma.dailyWeather.upsert({
      where: { districtId_date: { districtId, date } },
      update: rest,
      create: { districtId, date, ...rest },
    });
  }
}
