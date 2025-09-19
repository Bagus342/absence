import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UpdateSiswaPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Id harus berupa number');
    }

    return val;
  }
}
