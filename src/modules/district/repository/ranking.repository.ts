import { prisma } from "../../../db.config";
import { District, MosquitoIndex } from "../../../generated/prisma/client";

export type RankingRow = MosquitoIndex & {
  district: District;
};

export class RankingRepository {
  async findAllLatestWithDistrict(): Promise<RankingRow[]> {
    const rows = await prisma.mosquitoIndex.findMany({
      include: {
        district: true,
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