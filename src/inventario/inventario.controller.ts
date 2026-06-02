import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventarioService } from './inventario.service';

@Controller('inventario')
@UseGuards(AuthGuard('jwt'))
export class InventarioController {
  constructor(private inventarioService: InventarioService) {}

  @Get()
  getInventario(@Request() req: { user: { id: string } }) {
    return this.inventarioService.getInventario(req.user.id);
  }

  @Post(':cartaId/vender')
  venderCopias(
    @Request() req: { user: { id: string } },
    @Param('cartaId') cartaId: string,
    @Body('cantidad') cantidad: number,
  ) {
    return this.inventarioService.venderCopias(req.user.id, cartaId, cantidad);
  }
}
