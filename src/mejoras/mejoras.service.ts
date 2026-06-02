import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoMejora } from '@prisma/client';

export const NIVELES_MULTIPLICADOR = [
  { nivel: 1, puntosClick: 2, costo: 500 },
  { nivel: 2, puntosClick: 5, costo: 2000 },
  { nivel: 3, puntosClick: 10, costo: 8000 },
  { nivel: 4, puntosClick: 25, costo: 25000 },
  { nivel: 5, puntosClick: 50, costo: 100000 },
];

export const NIVELES_AUTO_CLICKER = [
  { nivel: 1, puntosPorSegundo: 1, costo: 5000 },
  { nivel: 2, puntosPorSegundo: 2, costo: 15000 },
  { nivel: 3, puntosPorSegundo: 5, costo: 40000 },
  { nivel: 4, puntosPorSegundo: 10, costo: 100000 },
  { nivel: 5, puntosPorSegundo: 25, costo: 250000 },
];

@Injectable()
export class MejorasService {
  constructor(private prisma: PrismaService) {}

  async getMejoras(usuarioId: string) {
    const mejoras = await this.prisma.mejora.findMany({
      where: { usuarioId },
    });

    const multiplicador = mejoras.find((m) => m.tipo === 'MULTIPLICADOR');
    const autoClicker = mejoras.find((m) => m.tipo === 'AUTO_CLICKER');

    const nivelMultiplicador = multiplicador?.nivel ?? 0;
    const nivelAutoClicker = autoClicker?.nivel ?? 0;

    const siguienteMultiplicador =
      NIVELES_MULTIPLICADOR.find((n) => n.nivel === nivelMultiplicador + 1) ??
      null;
    const siguienteAutoClicker =
      NIVELES_AUTO_CLICKER.find((n) => n.nivel === nivelAutoClicker + 1) ??
      null;

    return {
      multiplicador: {
        nivelActual: nivelMultiplicador,
        puntosClick:
          nivelMultiplicador > 0
            ? NIVELES_MULTIPLICADOR[nivelMultiplicador - 1].puntosClick
            : 1,
        siguiente: siguienteMultiplicador,
        maxNivel: NIVELES_MULTIPLICADOR.length,
      },
      autoClicker: {
        nivelActual: nivelAutoClicker,
        puntosPorSegundo:
          nivelAutoClicker > 0
            ? NIVELES_AUTO_CLICKER[nivelAutoClicker - 1].puntosPorSegundo
            : 0,
        siguiente: siguienteAutoClicker,
        maxNivel: NIVELES_AUTO_CLICKER.length,
      },
    };
  }

  async comprarMejora(usuarioId: string, tipo: TipoMejora) {
    const niveles =
      tipo === 'MULTIPLICADOR' ? NIVELES_MULTIPLICADOR : NIVELES_AUTO_CLICKER;

    const mejoraActual = await this.prisma.mejora.findUnique({
      where: { usuarioId_tipo: { usuarioId, tipo } },
    });

    const nivelActual = mejoraActual?.nivel ?? 0;
    const siguienteNivel = niveles.find((n) => n.nivel === nivelActual + 1);

    if (!siguienteNivel) {
      throw new BadRequestException('Ya tienes esta mejora al nivel máximo');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { puntos: true },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.puntos < siguienteNivel.costo) {
      throw new BadRequestException(
        `Puntos insuficientes. Necesitas ${siguienteNivel.costo} puntos`,
      );
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { puntos: { decrement: siguienteNivel.costo } },
      });

      const mejora = await tx.mejora.upsert({
        where: { usuarioId_tipo: { usuarioId, tipo } },
        create: { usuarioId, tipo, nivel: siguienteNivel.nivel },
        update: { nivel: siguienteNivel.nivel },
      });

      const usuarioActualizado = await tx.usuario.findUnique({
        where: { id: usuarioId },
        select: { puntos: true },
      });

      return {
        mejora,
        puntosActuales: usuarioActualizado?.puntos ?? 0,
      };
    });

    return resultado;
  }

  async getPuntosClick(usuarioId: string): Promise<number> {
    const mejora = await this.prisma.mejora.findUnique({
      where: { usuarioId_tipo: { usuarioId, tipo: 'MULTIPLICADOR' } },
    });

    if (!mejora) return 1;
    return NIVELES_MULTIPLICADOR[mejora.nivel - 1]?.puntosClick ?? 1;
  }

  async getPuntosPorSegundo(usuarioId: string): Promise<number> {
    const mejora = await this.prisma.mejora.findUnique({
      where: { usuarioId_tipo: { usuarioId, tipo: 'AUTO_CLICKER' } },
    });

    if (!mejora) return 0;
    return NIVELES_AUTO_CLICKER[mejora.nivel - 1]?.puntosPorSegundo ?? 0;
  }
}
