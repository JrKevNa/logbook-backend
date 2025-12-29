import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UsersModule } from 'src/users/users.module';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { LogbookModule } from 'src/logbook/logbook.module';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { CsrfModule } from 'src/csrf/csrf.module';
import { ProjectRepository } from './projects.repository';

@Module({
	imports: [TypeOrmModule.forFeature([Project])],
	providers: [ProjectRepository],
	exports: [ProjectRepository],
})
export class ProjectPersistenceModule {}

@Module({
	imports: [
		// TypeOrmModule.forFeature([Project]), 
		ProjectPersistenceModule,
		CaslModule, 
		CsrfModule
	],
	controllers: [ProjectsController],
	providers: [ProjectsService],
})
export class ProjectsModule {}
