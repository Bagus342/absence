import sharp from 'sharp';

export const compressImage = async (
  buffer: Buffer | ArrayBuffer,
  quality: number = 50,
) => {
  return await sharp(buffer).jpeg({ quality }).toBuffer();
};
