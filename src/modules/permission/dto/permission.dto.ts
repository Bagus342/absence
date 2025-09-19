import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const permissionSchema = z
  .object({
    nis: z.string().nonempty('Nis tidak boleh kosong'),
    keterangan: z.enum(['IZIN', 'SAKIT'], 'Keterangan tidak boleh kosong'),
  })
  .strict();

const querySchema = z.object({
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
  nis: z.string().optional(),
  keterangan: z.enum(['IZIN', 'SAKIT']).optional(),
  status: z.boolean().optional(),
  date: z.date().optional(),
});

export class PermissionDto extends createZodDto(permissionSchema) {}
export class QueryPermissionDto extends createZodDto(querySchema) {}
