import { Module } from '@nestjs/common';
import { SobreService } from './sobre.service';
import { SobreController } from './sobre.controller';

@Module({
  controllers: [SobreController],
  providers: [SobreService],
})
export class SobreModule {}
