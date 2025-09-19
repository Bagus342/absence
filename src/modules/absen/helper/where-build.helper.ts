import { Prisma } from '@prisma/client';
import { QueryDto } from '../dto/absen.dto';

export const whereBuildAbsen = (query: QueryDto) => {
  const where: Prisma.AbsenWhereInput = {};

  if (query.activity) {
    where.activity = { contains: query.activity, mode: 'insensitive' };
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.date) {
    where.createdAt = {};
    if (query.date) where.createdAt.gte = new Date(query.date);
  }

  return where;
};
