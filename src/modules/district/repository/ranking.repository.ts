import { prisma } from "../../../db.config";
import type { District, MosquitoIndex } from "../../../generated/prisma/client";

export type RankingRow = {
  id: number;
  districtId: number;
  date: Date;
  mosquitoIndex: number;
  level: number;
  createdAt: Date;
  district: {
    id: number;
    name: string;
  };
};

export class RankingRepository {
  async findAllLatestWithDistrict(): Promise<RankingRow[]> {
    const rows = await prisma.mosquitoIndex.findMany({
      select: {
        id: true,
        districtId: true,
        date: true,
        mosquitoIndex: true,
        level: true,
        createdAt: true,
        district: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
    });

    const latestByDistrict = new Map<number, RankingRow>();

    for (const row of rows) {
      if (!latestByDistrict.has(row.districtId)) {
        latestByDistrict.set(row.districtId, row);
      }
    }

    return Array.from(latestByDistrict.values());
  }
}