import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LiburSchema = z.object({
  tanggal: z.date().nonoptional('Tanggal tidak boleh kosong'),
});

export class LiburDto extends createZodDto(LiburSchema) {}
export type LiburType = z.infer<typeof LiburSchema>;
