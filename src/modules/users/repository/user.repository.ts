import { prisma } from '../../../db.config';


export class UserRepository {
  public async findUserById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  public async updateNickname(userId: number, newNickname: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { nickname: newNickname },
    });
  }
}