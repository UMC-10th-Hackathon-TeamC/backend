import { prisma } from "../../../db.config";
import { District, MosquitoIndex } from "../../../generated/prisma/client";

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
}
