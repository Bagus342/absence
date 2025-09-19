import { Module } from '@nestjs/common';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { UpdateSiswaPipe } from './pipes/update-validation.pipe';

@Module({
  providers: [FileValidationPipe, UpdateSiswaPipe],
  exports: [FileValidationPipe, UpdateSiswaPipe],
})
export class CommonModule {}
