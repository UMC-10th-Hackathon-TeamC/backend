import { prisma } from "../../../db.config";
import { District } from "../../../generated/prisma/client";

export class DistrictRepository {
  async findAll(): Promise<District[]> {
    return prisma.district.findMany({ orderBy: { id: "asc" } });
  }

  async findById(id: number): Promise<District | null> {
    return prisma.district.findUnique({ where: { id } });
  }
}
