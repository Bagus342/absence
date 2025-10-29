import { Prisma } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const createSchema = z.object({
  nis: z.string().nonempty('Nis tidak boleh kosong'),
  activity: z.string().optional(),
  status: z.enum(['ONTIME', 'LATE', 'PERMISSION']).optional(),
});

const attendanceSchema = z.object({
  rfid: z.string().nonempty('Rfid tidak boleh kosong'),
  activity: z.string().optional(),
  status: z.enum(['ONTIME', 'LATE', 'PERMISSION']).optional(),
});

const filterSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .string()
    .optional()
    .transform((val) => Number(val))
    .default(5),
  activity: z.string().optional(),
  status: z.enum(['ONTIME', 'LATE', 'PERMISSION']).optional(),
  date: z.date().optional(),
});

const archiveSchema = z
  .object({
    month: z
      .string()
      .nonempty('Bulan tidak boleh kosong')
      .transform((v) => Number(v)),
  })
  .strict();

export class CreateDto extends createZodDto(createSchema) {}
export class AttendanceDto extends createZodDto(attendanceSchema) {}
export class QueryDto extends createZodDto(filterSchema) {}
export class ArchiveDto extends createZodDto(archiveSchema) {}

export type AbsenWithPrisma = Prisma.AbsenGetPayload<{
  include: { siswa: true };
}>;
