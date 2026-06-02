import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Carta, Rareza } from '@prisma/client';

const PITY_SUAVE = 50;
const PITY_DURO_EXCLUSIVA = 200;
const PITY_DURO_SEKAI = 500;

const RAREZAS_ORDEN: Rareza[] = [
  'COMUN',
  'RARA',
  'EPICA',
  'MITICA',
  'LEGENDARIA',
  'SECRETA',
  'EXCLUSIVA',
  'SEKAI',
];

@Injectable()
export class SobreService {
  constructor(private prisma: PrismaService) {}

  async abrirSobre(usuarioId: string, sobreId: string) {
    const sobre = await this.prisma.sobre.findUnique({
      where: { id: sobreId, activo: true },
      include: {
        sobreCartas: { include: { carta: true } },
      },
    });

    if (!sobre) throw new NotFoundException('Sobre no encontrado');

    const sobreCartasActivas = sobre.sobreCartas.filter(
      (sc) => sc.carta?.activa === true,
    );

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { puntos: true },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.puntos < sobre.costo) {
      throw new BadRequestException(
        `Puntos insuficientes. Necesitas ${sobre.costo} puntos`,
      );
    }

    // Obtener o crear pity para este sobre específico
    let pity = await this.prisma.pity.findUnique({
      where: { usuarioId_sobreId: { usuarioId, sobreId } },
    });

    if (!pity) {
      pity = await this.prisma.pity.create({
        data: { usuarioId, sobreId },
      });
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { puntos: { decrement: sobre.costo } },
      });

      const apertura = await tx.apertura.create({
        data: { usuarioId, sobreId, puntosGastados: sobre.costo },
      });

      let contadorExclusiva = pity.contadorExclusiva;
      let contadorSekai = pity.contadorSekai;

      const cartasProcesadas: (Carta & {
        fueNueva: boolean;
        fuePity: boolean;
      })[] = [];

      for (let i = 0; i < sobre.cantCartas; i++) {
        contadorExclusiva++;
        contadorSekai++;

        let cartaForzada: Carta | null = null;
        let fuePity = false;

        if (contadorSekai >= PITY_DURO_SEKAI) {
          cartaForzada = this.obtenerCartaPorRareza(
            sobreCartasActivas,
            'SEKAI',
          );
          fuePity = true;
        } else if (contadorExclusiva >= PITY_DURO_EXCLUSIVA) {
          // Solo dar EXCLUSIVA aquí, no SEKAI
          cartaForzada = this.obtenerCartaPorRareza(
            sobreCartasActivas,
            'EXCLUSIVA',
          );
          fuePity = true;
        }

        const carta =
          cartaForzada ??
          this.ejecutarGachaConPity(sobreCartasActivas, contadorExclusiva);

        if (!carta) continue;

        if (carta.rareza === 'SEKAI') {
          contadorSekai = 0;
        } else if (carta.rareza === 'EXCLUSIVA') {
          contadorExclusiva = 0;
        }

        const enInventario = await tx.inventario.findUnique({
          where: { usuarioId_cartaId: { usuarioId, cartaId: carta.id } },
        });

        const fueNueva = !enInventario;

        await tx.inventario.upsert({
          where: { usuarioId_cartaId: { usuarioId, cartaId: carta.id } },
          create: { usuarioId, cartaId: carta.id, cantidad: 1 },
          update: { cantidad: { increment: 1 } },
        });

        if (fueNueva) {
          const albumId = carta.albumId ?? (await tx.album.findFirst())?.id;
          if (albumId) {
            const ultimaPosicion = await tx.albumEntrada.findFirst({
              where: { usuarioId, albumId },
              orderBy: { posicion: 'desc' },
            });
            await tx.albumEntrada.create({
              data: {
                usuarioId,
                albumId,
                cartaId: carta.id,
                posicion: (ultimaPosicion?.posicion ?? 0) + 1,
              },
            });
          }
        }

        await tx.aperturaResultado.create({
          data: { aperturaId: apertura.id, cartaId: carta.id, fueNueva },
        });

        cartasProcesadas.push({ ...carta, fueNueva, fuePity });
      }

      await tx.pity.update({
        where: { usuarioId_sobreId: { usuarioId, sobreId } },
        data: { contadorExclusiva, contadorSekai },
      });

      const usuarioActualizado = await tx.usuario.findUnique({
        where: { id: usuarioId },
        select: { puntos: true },
      });

      return {
        aperturaId: apertura.id,
        cartas: cartasProcesadas,
        puntosGastados: sobre.costo,
        puntosRestantes: usuarioActualizado?.puntos ?? 0,
        pity: { contadorExclusiva, contadorSekai },
      };
    });

    return resultado;
  }

  async getPitySobre(usuarioId: string, sobreId: string) {
    const pity = await this.prisma.pity.findUnique({
      where: { usuarioId_sobreId: { usuarioId, sobreId } },
    });
    return {
      contadorExclusiva: pity?.contadorExclusiva ?? 0,
      contadorSekai: pity?.contadorSekai ?? 0,
      pitoDuroExclusiva: PITY_DURO_EXCLUSIVA,
      pitoDuroSekai: PITY_DURO_SEKAI,
      pitoSuave: PITY_SUAVE,
    };
  }

  async getPityTodos(usuarioId: string) {
    const pities = await this.prisma.pity.findMany({
      where: { usuarioId },
    });
    return pities.reduce(
      (acc, p) => {
        acc[p.sobreId] = {
          contadorExclusiva: p.contadorExclusiva,
          contadorSekai: p.contadorSekai,
        };
        return acc;
      },
      {} as Record<
        string,
        { contadorExclusiva: number; contadorSekai: number }
      >,
    );
  }

  async listarSobres() {
    return this.prisma.sobre.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        costo: true,
        cantCartas: true,
        imagenUrl: true,
      },
    });
  }

  async getAlbums(usuarioId: string) {
    const albums = await this.prisma.album.findMany();

    const resultado = await Promise.all(
      albums.map(async (album) => {
        const entradas = await this.prisma.albumEntrada.findMany({
          where: { usuarioId, albumId: album.id },
          include: { carta: true },
          orderBy: { posicion: 'asc' },
        });

        return {
          id: album.id,
          nombre: album.nombre,
          descripcion: album.descripcion,
          totalCartas: album.totalCartas,
          imagenUrl: album.imagenUrl,
          entradas: entradas.map((e) => ({
            posicion: e.posicion,
            pegadaEn: e.pegadaEn,
            carta: e.carta,
          })),
          progreso: entradas.length,
        };
      }),
    );

    return resultado;
  }

  private obtenerCartaPorRareza(
    sobreCartas: { carta: Carta | null; peso: number }[],
    rareza: Rareza,
  ): Carta | null {
    const pool = sobreCartas.filter(
      (sc) => sc.carta?.rareza === rareza && sc.carta?.activa,
    );
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)].carta;
  }

  private ejecutarGachaConPity(
    sobreCartas: { carta: Carta | null; peso: number }[],
    contadorExclusiva: number,
  ): Carta | null {
    const pool = sobreCartas.filter(
      (sc) => sc.carta !== null && sc.carta.activa,
    );

    // Aplicar boost a rarezas altas si estamos en zona de pity suave
    const boost =
      contadorExclusiva >= PITY_SUAVE
        ? 1 +
          ((contadorExclusiva - PITY_SUAVE) /
            (PITY_DURO_EXCLUSIVA - PITY_SUAVE)) *
            3
        : 1;

    const poolConBoost = pool.map((sc) => {
      const rarezaIndex = RAREZAS_ORDEN.indexOf(sc.carta!.rareza);
      const esAltaRareza = rarezaIndex >= RAREZAS_ORDEN.indexOf('LEGENDARIA');
      return {
        ...sc,
        pesoEfectivo: esAltaRareza ? sc.peso * boost : sc.peso,
      };
    });

    const pesoTotal = poolConBoost.reduce(
      (sum, sc) => sum + sc.pesoEfectivo,
      0,
    );
    const roll = Math.random() * pesoTotal;
    let acumulado = 0;

    for (const sc of poolConBoost) {
      acumulado += sc.pesoEfectivo;
      if (roll <= acumulado) return sc.carta;
    }

    return pool[pool.length - 1]?.carta ?? null;
  }
}
