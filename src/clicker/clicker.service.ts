import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MejorasService } from '../mejoras/mejoras.service';

@Injectable()
export class ClickerService {
  constructor(
    private prisma: PrismaService,
    private mejorasService: MejorasService,
  ) {}

  async click(usuarioId: string): Promise<{ puntos: number }> {
    const puntosClick = await this.mejorasService.getPuntosClick(usuarioId);

    const usuario = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { puntos: { increment: puntosClick } },
      select: { puntos: true },
    });

    return { puntos: usuario.puntos };
  }

  async getPuntos(usuarioId: string): Promise<{ puntos: number }> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { puntos: true },
    });
    return { puntos: usuario?.puntos ?? 0 };
  }

  async tickAutoClicker(usuarioId: string): Promise<{ puntos: number }> {
    const puntosPorSegundo =
      await this.mejorasService.getPuntosPorSegundo(usuarioId);

    if (puntosPorSegundo === 0) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { puntos: true },
      });
      return { puntos: usuario?.puntos ?? 0 };
    }

    const usuario = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { puntos: { increment: puntosPorSegundo } },
      select: { puntos: true },
    });

    return { puntos: usuario.puntos };
  }
}
