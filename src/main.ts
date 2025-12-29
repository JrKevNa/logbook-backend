import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';
import { CaslExceptionFilter } from './casl/casl-exception.filter';
import { TenantInterceptor } from './common/tenant/tenant.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: WinstonModule.createLogger({
            transports: [
                // Log to file
                new winston.transports.File({
                filename: 'app.log',
                level: 'info',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                ),
                }),
                // Log to console
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                    ),
                }),
            ],
        }),
    });

    const config = app.get(ConfigService);
    const port = config.get<number>('APP_PORT', 3001);
    const nodeEnv = config.get<string>('NODE_ENV', 'development');

    app.useGlobalInterceptors(new TenantInterceptor());
    app.use(cookieParser());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalFilters(new CaslExceptionFilter());

    app.enableCors({
        origin: nodeEnv === 'production'
            ? 'https://yourdomain.com'
            : 'http://localhost:3000',
        credentials: true,
    });

    app.useStaticAssets(join(__dirname, '..', 'uploads'));

    await app.listen(port);
}

bootstrap();