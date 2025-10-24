import { Siswa } from '@prisma/client';
import * as XLXS from 'xlsx';

export const archiveHelper = (
  sheetName: string,
  headers: string[],
  siswa: Siswa[],
) => {
  const worksheetData = [
    headers,
    ...siswa.map((s) => [s.nis, s.name, s.kelas, s.phone, s.wali]),
  ];
  const worksheet = XLXS.utils.aoa_to_sheet(worksheetData);
  const workbook = XLXS.utils.book_new();
  XLXS.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLXS.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  }) as Buffer;

  return buffer;
};
