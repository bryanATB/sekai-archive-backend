import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClickerService } from './clicker.service';

@Controller('clicker')
export class ClickerController {
  constructor(private clickerService: ClickerService) {}

  @Post('click')
  @UseGuards(AuthGuard('jwt'))
  click(@Request() req: { user: { id: string } }) {
    return this.clickerService.click(req.user.id);
  }

  @Post('puntos')
  @UseGuards(AuthGuard('jwt'))
  getPuntos(@Request() req: { user: { id: string } }) {
    return this.clickerService.getPuntos(req.user.id);
  }

  @Post('tick')
  @UseGuards(AuthGuard('jwt'))
  tick(@Request() req: { user: { id: string } }) {
    return this.clickerService.tickAutoClicker(req.user.id);
  }
}
