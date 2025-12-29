import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { Image } from '../../entities/image.entity';
import { Ad } from '../../entities/ad.entity';
import { AdsModule } from '../ads/ads.module';

@Module({
  imports: [TypeOrmModule.forFeature([Image, Ad]), forwardRef(() => AdsModule)],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}

