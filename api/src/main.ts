import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:4200,http://127.0.0.1:4200')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
