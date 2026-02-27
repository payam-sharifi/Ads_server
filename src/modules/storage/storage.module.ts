import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { R2StorageService } from './r2-storage.service';
import { ImageProcessorService } from './image-processor.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [R2StorageService, ImageProcessorService],
  exports: [R2StorageService, ImageProcessorService],
})
export class StorageModule {}
