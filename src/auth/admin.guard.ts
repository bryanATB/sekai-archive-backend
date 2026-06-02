import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    if (!usuario?.esAdmin) {
      throw new ForbiddenException('No tienes permisos de administrador');
    }

    return true;
  }
}
