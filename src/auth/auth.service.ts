import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { Usuario } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registro(
    dto: RegistroDto,
  ): Promise<{ access_token: string; usuarioId: string }> {
    const existe = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existe) {
      throw new ConflictException('El email o username ya está en uso');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.$transaction(async (tx) => {
      const nuevoUsuario = await tx.usuario.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hash,
        },
      });

      return nuevoUsuario;
    });

    return this.generarToken(usuario.id, usuario.email, false);
  }

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; usuarioId: string }> {
    const usuario: Usuario | null = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const passwordValido = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generarToken(usuario.id, usuario.email, usuario.esAdmin);
  }

  private generarToken(usuarioId: string, email: string, esAdmin: boolean) {
    const payload = { sub: usuarioId, email, esAdmin };
    return {
      access_token: this.jwtService.sign(payload),
      usuarioId,
      esAdmin,
    };
  }
}
