import { Prisma } from '@prisma/client';
import { QueryPermissionDto } from '../dto/permission.dto';

export const whereBuildPermission = (query: QueryPermissionDto) => {
  const where: Prisma.PermissionWhereInput = {};

  if (query.nis) where.nis = { contains: query.nis, mode: 'insensitive' };

  if (query.keterangan) where.keterangan = query.keterangan;

  if (query.status) {
    where.status = query.status;
  }

  if (query.date) {
    where.createdAt = {};
    if (query.date) where.createdAt.gte = new Date(query.date);
  }

  return where;
};
