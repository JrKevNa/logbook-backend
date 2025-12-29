import { Module } from '@nestjs/common';
import { DetailProjectsService } from './detail-projects.service';
import { DetailProjectsController } from './detail-projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetailProject } from './entities/detail-project.entity';
import { UsersModule } from 'src/users/users.module';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { CsrfModule } from 'src/csrf/csrf.module';
import { DetailProjectRepository } from './detail-projects.repository';

@Module({
	imports: [TypeOrmModule.forFeature([DetailProject])],
	providers: [DetailProjectRepository],
	exports: [DetailProjectRepository],
})
export class DetailProjectPersistenceModule {}

@Module({
	imports: [
		// TypeOrmModule.forFeature([DetailProject]), 
		DetailProjectPersistenceModule,
		CaslModule, 
		CsrfModule, 
		UsersModule
	],
	controllers: [DetailProjectsController],
	providers: [DetailProjectsService],
})
export class DetailProjectsModule {}
