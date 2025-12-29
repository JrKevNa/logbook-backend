import { Module } from '@nestjs/common';
import { ToDoListService } from './to-do-list.service';
import { ToDoListController } from './to-do-list.controller';
import { ToDoList } from './entities/to-do-list.entity';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { LogbookModule } from 'src/logbook/logbook.module';
import { CaslModule } from 'src/casl/casl.module';
import { CsrfModule } from 'src/csrf/csrf.module';
import { ToDoListRepository } from './to-do-list.repository';

@Module({
	imports: [TypeOrmModule.forFeature([ToDoList])],
	providers: [ToDoListRepository],
	exports: [ToDoListRepository],
})
export class ToDoListPersistenceModule {}

@Module({
	imports: [
		// TypeOrmModule.forFeature([ToDoList]), 
		ToDoListPersistenceModule,
		CaslModule, 
		CsrfModule
	],
	controllers: [ToDoListController],
	providers: [ToDoListService],
})
export class ToDoListModule {}
