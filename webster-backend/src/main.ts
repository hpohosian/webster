import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().set('trust proxy', true);

  app.use(
    cors({
      origin: [
        'http://localhost:5173',
        'https://webster-nine.vercel.app',
        'https://webster-frontend-production.up.railway.app',
      ],
      credentials: true,
    }),
  );

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'supersecret', // ключ для подписи cookies
      resave: false, // не сохранять сессию, если она не изменилась
      saveUninitialized: false, // не сохранять пустые сессии
      cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // secure только в продакшне
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      }, // 1 час
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('UEvent API')
    .setDescription('API for UEvent')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
