import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { CaslModule } from 'src/casl/casl.module';
import { CsrfModule } from 'src/csrf/csrf.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Role]),
		CaslModule, 
		CsrfModule
	],
	controllers: [RolesController],
	providers: [RolesService],
	exports: [RolesService]
})
export class RolesModule {}
