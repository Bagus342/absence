import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const xlsxFileSchema = z
  .custom<Express.Multer.File>(
    (val) => val instanceof Object && 'mimetype' in val,
    { message: 'File harus berupa .xlsx' },
  )
  .refine(
    (file) =>
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    { message: 'File harus berupa .xlsx' },
  );

const zipFileSchema = z
  .custom<Express.Multer.File>(
    (val) => val instanceof Object && 'mimetype' in val,
    { message: 'File harus berupa .zip' },
  )
  .refine((file) => file.mimetype === 'application/zip', {
    message: 'File harus berupa .zip',
  });

const UploadSchema = z
  .object({
    xlsx: z
      .array(xlsxFileSchema)
      .min(1, { message: 'File excel tidak boleh kosong' })
      .optional()
      .default([]),
    zip: z
      .array(zipFileSchema)
      .min(1, { message: 'File zip tidak boleh kosong' })
      .optional()
      .default([]),
  })
  .strict();

export class UploadDto extends createZodDto(UploadSchema) {}
