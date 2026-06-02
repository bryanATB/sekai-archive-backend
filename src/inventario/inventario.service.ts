import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Rareza } from '@prisma/client';

const PRECIO_VENTA: Record<Rareza, number> = {
  COMUN: 5,
  RARA: 10,
  EPICA: 25,
  MITICA: 50,
  LEGENDARIA: 100,
  SECRETA: 500,
  EXCLUSIVA: 1000,
  SEKAI: 3000,
};

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async getInventario(usuarioId: string) {
    const entradas = await this.prisma.inventario.findMany({
      where: { usuarioId },
      include: { carta: true },
      orderBy: { carta: { rareza: 'asc' } },
    });

    return entradas.map((e) => ({
      cartaId: e.cartaId,
      cantidad: e.cantidad,
      copias: Math.max(0, e.cantidad - 1),
      precioVenta: PRECIO_VENTA[e.carta.rareza],
      carta: e.carta,
    }));
  }

  async venderCopias(usuarioId: string, cartaId: string, cantidad: number) {
    if (cantidad < 1) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const entrada = await this.prisma.inventario.findUnique({
      where: { usuarioId_cartaId: { usuarioId, cartaId } },
      include: { carta: true },
    });

    if (!entrada)
      throw new NotFoundException('Carta no encontrada en inventario');

    const copiasDisponibles = entrada.cantidad - 1;
    if (copiasDisponibles < cantidad) {
      throw new BadRequestException(
        `Solo tienes ${copiasDisponibles} copia(s) disponibles para vender`,
      );
    }

    const puntosGanados = PRECIO_VENTA[entrada.carta.rareza] * cantidad;

    const resultado = await this.prisma.$transaction(async (tx) => {
      await tx.inventario.update({
        where: { usuarioId_cartaId: { usuarioId, cartaId } },
        data: { cantidad: { decrement: cantidad } },
      });

      const usuarioActualizado = await tx.usuario.update({
        where: { id: usuarioId },
        data: { puntos: { increment: puntosGanados } },
        select: { puntos: true },
      });

      return {
        puntosGanados,
        puntosActuales: usuarioActualizado.puntos,
        cartaVendida: entrada.carta.nombre,
        cantidadVendida: cantidad,
      };
    });

    return resultado;
  }
}
