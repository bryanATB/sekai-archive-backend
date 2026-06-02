import { Module } from '@nestjs/common';
import { MejorasService } from './mejoras.service';
import { MejorasController } from './mejoras.controller';

@Module({
  controllers: [MejorasController],
  providers: [MejorasService],
  exports: [MejorasService],
})
export class MejorasModule {}
