import { Prisma } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const absenSchema = z.object({
  nis: z.string().nonempty('Nis tidak boleh kosong'),
  activity: z.string().optional(),
  status: z.enum(['ONTIME', 'LATE', 'PERMISSION']).optional(),
});

const filterSchema = z.object({
  page: z
    .number()
    .optional()
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .number()
    .optional()
    .transform((val) => Number(val))
    .default(5),
  activity: z.string().optional(),
  status: z.enum(['ONTIME', 'LATE', 'PERMISSION']).optional(),
  date: z.date().optional(),
});

export class AbsenDto extends createZodDto(absenSchema) {}
export class QueryDto extends createZodDto(filterSchema) {}

export type AbsenWithPrisma = Prisma.AbsenGetPayload<{
  include: { siswa: true };
}>;
