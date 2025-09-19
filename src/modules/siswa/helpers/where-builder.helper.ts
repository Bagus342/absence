import { Prisma } from '@prisma/client';
import { QueryDto } from '../dto/query.dto';

export const whereBuild = (query: QueryDto): Prisma.SiswaWhereInput => {
  const where: Prisma.SiswaWhereInput = {};

  if (query.nis) {
    where.nis = { contains: query.nis, mode: 'insensitive' };
  }

  if (query.kelas) {
    where.kelas = { contains: query.kelas, mode: 'insensitive' };
  }

  if (query.wali) {
    where.wali = { contains: query.wali, mode: 'insensitive' };
  }

  return where;
};
