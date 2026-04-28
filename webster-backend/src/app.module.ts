import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersController } from './users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EmailVerificationsModule } from './email-verifications/email-verifications.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { PasswordResetsModule } from './password-resets/password-resets.module';
import { ProjectsModule } from './projects/projects.module';
import { FilesService } from './files/files.service';
import { FilesController } from './files/files.controller';
import { FilesModule } from './files/files.module';
import { ElementsService } from './elements/elements.service';
import { ElementsController } from './elements/elements.controller';
import { ElementsModule } from './elements/elements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    EmailVerificationsModule,
    MailModule,
    PasswordResetsModule,
    ProjectsModule,
    FilesModule,
    ElementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
