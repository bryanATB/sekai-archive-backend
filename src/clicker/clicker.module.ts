import { Module } from '@nestjs/common';
import { ClickerService } from './clicker.service';
import { ClickerController } from './clicker.controller';
import { MejorasModule } from '../mejoras/mejoras.module';

@Module({
  imports: [MejorasModule],
  controllers: [ClickerController],
  providers: [ClickerService],
})
export class ClickerModule {}
