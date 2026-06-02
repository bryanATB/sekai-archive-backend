import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClickerModule } from './clicker/clicker.module';
import { AdminModule } from './admin/admin.module';
import { SobreModule } from './sobre/sobre.module';
import { InventarioModule } from './inventario/inventario.module';
import { MejorasModule } from './mejoras/mejoras.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClickerModule,
    AdminModule,
    SobreModule,
    InventarioModule,
    MejorasModule,
  ],
})
export class AppModule {}
