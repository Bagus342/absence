import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const QuerySchema = z.object({
  page: z
    .string()
    .transform((val) => Number(val))
    .optional()
    .default(1),
  limit: z
    .string()
    .optional()
    .transform((val) => Number(val))
    .default(5),
  nis: z.string().optional(),
  kelas: z.string().optional(),
  wali: z.string().optional(),
});

export class QueryDto extends createZodDto(QuerySchema) {}

export type SiswaQuery = z.infer<typeof QuerySchema>;
