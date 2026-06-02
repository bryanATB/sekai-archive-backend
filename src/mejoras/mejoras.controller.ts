import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MejorasService } from './mejoras.service';
import { TipoMejora } from '@prisma/client';

@Controller('mejoras')
@UseGuards(AuthGuard('jwt'))
export class MejorasController {
  constructor(private mejorasService: MejorasService) {}

  @Get()
  getMejoras(@Request() req: { user: { id: string } }) {
    return this.mejorasService.getMejoras(req.user.id);
  }

  @Post('comprar')
  comprarMejora(
    @Request() req: { user: { id: string } },
    @Body('tipo') tipo: TipoMejora,
  ) {
    return this.mejorasService.comprarMejora(req.user.id, tipo);
  }
}
