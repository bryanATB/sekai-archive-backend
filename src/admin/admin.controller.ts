import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { CrearCartaDto } from './dto/crear-carta.dto';
import { CrearSobreDto } from './dto/crear-sobre.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Cartas
  @Post('cartas')
  crearCarta(@Body() dto: CrearCartaDto) {
    return this.adminService.crearCarta(dto);
  }

  @Get('cartas')
  listarCartas() {
    return this.adminService.listarCartas();
  }

  @Patch('cartas/:id/toggle')
  toggleCarta(@Param('id') id: string) {
    return this.adminService.toggleCartaActiva(id);
  }

  // Sobres
  @Post('sobres')
  crearSobre(@Body() dto: CrearSobreDto) {
    return this.adminService.crearSobre(dto);
  }

  @Get('sobres')
  listarSobres() {
    return this.adminService.listarSobres();
  }

  @Post('sobres/:sobreId/cartas/:cartaId')
  agregarCarta(
    @Param('sobreId') sobreId: string,
    @Param('cartaId') cartaId: string,
    @Body('peso') peso: number,
  ) {
    return this.adminService.agregarCartaASobre(sobreId, cartaId, peso);
  }

  // Stats
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Patch('cartas/:id')
  editarCarta(@Param('id') id: string, @Body() dto: Partial<CrearCartaDto>) {
    return this.adminService.editarCarta(id, dto);
  }

  @Delete('cartas/:id')
  eliminarCarta(@Param('id') id: string) {
    return this.adminService.eliminarCarta(id);
  }

  @Patch('sobres/:id')
  editarSobre(@Param('id') id: string, @Body() dto: Partial<CrearSobreDto>) {
    return this.adminService.editarSobre(id, dto);
  }

  @Delete('sobres/:id')
  eliminarSobre(@Param('id') id: string) {
    return this.adminService.eliminarSobre(id);
  }

  @Post('albums')
  crearAlbum(
    @Body() dto: { nombre: string; descripcion?: string; totalCartas: number },
  ) {
    return this.adminService.crearAlbum(dto);
  }

  @Get('albums')
  listarAlbums() {
    return this.adminService.listarAlbums();
  }

  @Patch('albums/:id')
  editarAlbum(
    @Param('id') id: string,
    @Body()
    dto: { nombre?: string; descripcion?: string; totalCartas?: number },
  ) {
    return this.adminService.editarAlbum(id, dto);
  }

  @Delete('albums/:id')
  eliminarAlbum(@Param('id') id: string) {
    return this.adminService.eliminarAlbum(id);
  }
}
