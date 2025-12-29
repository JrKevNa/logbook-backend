import { Module } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { LogbookController } from './logbook.controller';
import { Logbook } from './entities/logbook.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/companies/entities/company.entity';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { CsrfModule } from 'src/csrf/csrf.module';
import { LogbookRepository } from './logbook.repository';

@Module({
	imports: [TypeOrmModule.forFeature([Logbook])],
	providers: [LogbookRepository],
	exports: [LogbookRepository],
})
export class LogbookPersistenceModule {}

@Module({
	// imports: [TypeOrmModule.forFeature([Logbook])],
	imports: [
		// TypeOrmModule.forFeature([Logbook]), 
		LogbookPersistenceModule,
		CaslModule, 
		CsrfModule,
		UsersModule
	],
	controllers: [LogbookController],
	providers: [LogbookService],
	exports: [LogbookService],
	// providers: [LogbookService],
})
export class LogbookModule {}
