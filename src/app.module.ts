import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { LogbookModule } from './logbook/logbook.module';
import { ToDoListModule } from './to-do-list/to-do-list.module';
import { ProjectsModule } from './projects/projects.module';
import { DetailProjectsModule } from './detail-projects/detail-projects.module';
import { CaslModule } from './casl/casl.module';
import { CsrfModule } from './csrf/csrf.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				host: config.get('DB_HOST'),
				port: config.get<number>('DB_PORT'),
				username: config.get('DB_USERNAME'),
				password: config.get('DB_PASSWORD'),
				database: config.get('DB_NAME'),
				autoLoadEntities: true,
				synchronize: config.get<boolean>('DB_SYNC'),
				namingStrategy: new SnakeNamingStrategy(),
			}),
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'uploads'),
			serveRoot: '/uploads',
		}),
		ThrottlerModule.forRoot([
			{
				ttl: 60 * 1000, // milliseconds window
				limit: 10,      // max 10 reqs per ttl
			},
		]),

		CsrfModule,
		CaslModule,

		RolesModule,
		UserRolesModule,
		UsersModule,
		CompaniesModule,

		LogbookModule,
		ToDoListModule,
		ProjectsModule,
		DetailProjectsModule,

		AuthModule, // place auth near the end
	],
	controllers: [AppController],
	// providers: [AppService],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
