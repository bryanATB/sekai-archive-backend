import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todas las rutas: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Validación automática de DTOs (lo usaremos mucho)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // CORS abierto por ahora para desarrollo local
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Sekai Archive backend corriendo en: http://localhost:3000`);
}
bootstrap().catch((err) => {
  console.error('Error starting server', err);
});
