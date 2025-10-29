import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSiswaSchema = z
  .object({
    nis: z.string().nonempty('Nis tidak boleh kosong'),
    rfid: z.string().nonempty('RFID tidak boleh kosong'),
    name: z.string().nonempty('Nama tidak boleh kosong'),
    phone: z.string().min(6, 'Nomor Telepon minimal 6 karakter'),
    wali: z.string().nonempty('Wali Murid tidak boleh kosong'),
    kelas: z.string().nonempty('Kelas tidak boleh kosong'),
  })
  .strict();

export const ImportSiswaSchema = z
  .object({
    nis: z.string().nonempty('Nis tidak boleh kosong'),
    rfid: z.string().nonempty('RFID tidak boleh kosong'),
    name: z.string().nonempty('Nama tidak boleh kosong'),
    image: z.string().nonempty('Image tidak boleh kosong'),
    phone: z.string().min(6, 'Nomor Telepon minimal 6 karakter'),
    wali: z.string().nonempty('Wali Murid tidak boleh kosong'),
    kelas: z.string().nonempty('Kelas tidak boleh kosong'),
    qr_payload: z.string().optional(),
  })
  .strict();

export class ImportSiswaDto extends createZodDto(ImportSiswaSchema) {}
export class CreateSiswaDto extends createZodDto(CreateSiswaSchema) {}
export type CreateSiswa = z.infer<typeof CreateSiswaSchema>;
export type ImportSiswa = z.infer<typeof ImportSiswaSchema>;
