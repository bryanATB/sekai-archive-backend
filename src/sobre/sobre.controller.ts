import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SobreService } from './sobre.service';

@Controller('sobres')
@UseGuards(AuthGuard('jwt'))
export class SobreController {
  constructor(private sobreService: SobreService) {}

  @Get()
  listarSobres() {
    return this.sobreService.listarSobres();
  }

  @Get('albums')
  getAlbums(@Request() req: { user: { id: string } }) {
    return this.sobreService.getAlbums(req.user.id);
  }

  @Post(':id/abrir')
  abrirSobre(
    @Request() req: { user: { id: string } },
    @Param('id') sobreId: string,
  ) {
    return this.sobreService.abrirSobre(req.user.id, sobreId);
  }

  @Get('pity')
  getPityTodos(@Request() req: { user: { id: string } }) {
    return this.sobreService.getPityTodos(req.user.id);
  }

  @Get(':sobreId/pity')
  getPitySobre(
    @Request() req: { user: { id: string } },
    @Param('sobreId') sobreId: string,
  ) {
    return this.sobreService.getPitySobre(req.user.id, sobreId);
  }
}
