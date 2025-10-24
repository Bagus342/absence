import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const archiveSchema = z
  .object({
    kelas: z.string().nonempty('Kelas tidak boleh kosong'),
  })
  .strict();

export class ArchiveDto extends createZodDto(archiveSchema) {}
