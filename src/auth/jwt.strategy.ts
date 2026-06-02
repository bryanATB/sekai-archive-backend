import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usuarioService: UsuarioService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'dev_secret',
    });
  }

  async validate(payload: { sub: string; email: string; esAdmin: boolean }) {
    const usuario = await this.usuarioService.buscarPorId(payload.sub);
    if (!usuario) throw new UnauthorizedException();
    return usuario;
  }
}
