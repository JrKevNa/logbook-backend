import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { RolesService } from 'src/roles/roles.service';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { CompaniesService } from 'src/companies/companies.service';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/user-roles/entities/user-role.entity';
import { Company } from 'src/companies/entities/company.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { RolesModule } from 'src/roles/roles.module';
import { UserRolesModule } from 'src/user-roles/user-roles.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { CaslModule } from 'src/casl/casl.module';
import { CsrfModule } from 'src/csrf/csrf.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role, UserRole, Company]),
		PassportModule,
		// JwtModule.register({
		// 	global: true,
		// 	secret: jwtConstants.secret,
		// 	signOptions: { expiresIn: '1h' }, // adjust as needed
		// }),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('JWT_ACCESS_SECRET'),
				signOptions: {
					expiresIn: config.get<StringValue>('JWT_ACCESS_EXPIRES_IN'),
				},
			}),
		}),
		ConfigModule,
		CaslModule, 
		CsrfModule,
		UsersModule,
		RolesModule,
		UserRolesModule,
		CompaniesModule
	],
	controllers: [AuthController],
	providers: [JwtStrategy, AuthService],
	exports: [JwtStrategy, AuthService],
})
export class AuthModule {}
