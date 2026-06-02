import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearCartaDto } from './dto/crear-carta.dto';
import { CrearSobreDto } from './dto/crear-sobre.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── CARTAS ──────────────────────────────────────────

  async crearCarta(dto: CrearCartaDto) {
    return this.prisma.carta.create({ data: dto });
  }

  async listarCartas() {
    return this.prisma.carta.findMany({
      orderBy: { rareza: 'asc' },
      include: { album: { select: { id: true, nombre: true } } },
    });
  }

  async toggleCartaActiva(id: string) {
    const carta = await this.prisma.carta.findUnique({ where: { id } });
    if (!carta) throw new NotFoundException('Carta no encontrada');

    return this.prisma.carta.update({
      where: { id },
      data: { activa: !carta.activa },
    });
  }

  // ── SOBRES ──────────────────────────────────────────

  async crearSobre(dto: CrearSobreDto) {
    const { cartas, ...sobreData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const sobre = await tx.sobre.create({ data: sobreData });

      if (cartas && cartas.length > 0) {
        await tx.sobreCarta.createMany({
          data: cartas.map((c) => ({
            sobreId: sobre.id,
            cartaId: c.cartaId,
            peso: c.peso,
          })),
        });
      }

      return tx.sobre.findUnique({
        where: { id: sobre.id },
        include: { sobreCartas: { include: { carta: true } } },
      });
    });
  }

  async listarSobres() {
    return this.prisma.sobre.findMany({
      include: {
        sobreCartas: {
          include: { carta: true },
        },
      },
    });
  }

  async agregarCartaASobre(sobreId: string, cartaId: string, peso: number) {
    const sobre = await this.prisma.sobre.findUnique({
      where: { id: sobreId },
    });
    if (!sobre) throw new NotFoundException('Sobre no encontrado');

    const carta = await this.prisma.carta.findUnique({
      where: { id: cartaId },
    });
    if (!carta) throw new NotFoundException('Carta no encontrada');

    return this.prisma.sobreCarta.upsert({
      where: { sobreId_cartaId: { sobreId, cartaId } },
      create: { sobreId, cartaId, peso },
      update: { peso },
    });
  }

  // ── STATS ────────────────────────────────────────────

  async getStats() {
    const [totalCartas, totalSobres, totalUsuarios] = await Promise.all([
      this.prisma.carta.count(),
      this.prisma.sobre.count(),
      this.prisma.usuario.count(),
    ]);

    return { totalCartas, totalSobres, totalUsuarios };
  }

  async editarCarta(id: string, dto: Partial<CrearCartaDto>) {
    const carta = await this.prisma.carta.findUnique({ where: { id } });
    if (!carta) throw new NotFoundException('Carta no encontrada');
    return this.prisma.carta.update({ where: { id }, data: dto });
  }

  async eliminarCarta(id: string) {
    const carta = await this.prisma.carta.findUnique({ where: { id } });
    if (!carta) throw new NotFoundException('Carta no encontrada');

    await this.prisma.$transaction([
      this.prisma.aperturaResultado.deleteMany({ where: { cartaId: id } }),
      this.prisma.albumEntrada.deleteMany({ where: { cartaId: id } }),
      this.prisma.inventario.deleteMany({ where: { cartaId: id } }),
      this.prisma.sobreCarta.deleteMany({ where: { cartaId: id } }),
      this.prisma.carta.delete({ where: { id } }),
    ]);

    return { eliminado: true };
  }

  async editarSobre(id: string, dto: Partial<CrearSobreDto>) {
    const sobre = await this.prisma.sobre.findUnique({ where: { id } });
    if (!sobre) throw new NotFoundException('Sobre no encontrado');

    const { cartas, ...sobreData } = dto;

    return this.prisma.$transaction(async (tx) => {
      await tx.sobre.update({ where: { id }, data: sobreData });

      if (cartas && cartas.length > 0) {
        await tx.sobreCarta.deleteMany({ where: { sobreId: id } });
        await tx.sobreCarta.createMany({
          data: cartas.map((c) => ({
            sobreId: id,
            cartaId: c.cartaId,
            peso: c.peso,
          })),
        });
      }

      return tx.sobre.findUnique({
        where: { id },
        include: { sobreCartas: { include: { carta: true } } },
      });
    });
  }

  async eliminarSobre(id: string) {
    const sobre = await this.prisma.sobre.findUnique({ where: { id } });
    if (!sobre) throw new NotFoundException('Sobre no encontrado');

    await this.prisma.$transaction([
      this.prisma.aperturaResultado.deleteMany({
        where: { apertura: { sobreId: id } },
      }),
      this.prisma.apertura.deleteMany({ where: { sobreId: id } }),
      this.prisma.sobreCarta.deleteMany({ where: { sobreId: id } }),
      this.prisma.pity.deleteMany({ where: { sobreId: id } }),
      this.prisma.sobre.delete({ where: { id } }),
    ]);

    return { eliminado: true };
  }

  async crearAlbum(dto: {
    nombre: string;
    descripcion?: string;
    totalCartas: number;
  }) {
    return this.prisma.album.create({ data: dto });
  }

  async listarAlbums() {
    return this.prisma.album.findMany({
      include: {
        _count: { select: { entradas: true } },
      },
    });
  }

  async editarAlbum(
    id: string,
    dto: { nombre?: string; descripcion?: string; totalCartas?: number },
  ) {
    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) throw new NotFoundException('Álbum no encontrado');
    return this.prisma.album.update({ where: { id }, data: dto });
  }

  async eliminarAlbum(id: string) {
    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) throw new NotFoundException('Álbum no encontrado');
    return this.prisma.album.delete({ where: { id } });
  }
}
