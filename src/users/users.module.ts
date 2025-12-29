import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersController } from '../users/users.controller';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { RolesModule } from '../roles/roles.module';
import { CaslModule } from 'src/casl/casl.module';
import { CsrfModule } from 'src/csrf/csrf.module';
import { UsersRepository } from './users.repository';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [UsersRepository],
	exports: [UsersRepository],
})
export class UsersPersistenceModule {}

@Module({
	imports: [
		// TypeOrmModule.forFeature([User, UserRole, Role]), 
		UsersPersistenceModule,
		CaslModule, 
		UserRolesModule, 
		RolesModule, 
		CsrfModule
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService], 
})
export class UsersModule {}
