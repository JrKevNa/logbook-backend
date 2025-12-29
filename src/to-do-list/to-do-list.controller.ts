import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ToDoListService } from './to-do-list.service';
import { CreateToDoListDto } from './dto/create-to-do-list.dto';
import { UpdateToDoListDto } from './dto/update-to-do-list.dto';
import { AuthGuard } from '@nestjs/passport';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { CsrfGuard } from 'src/csrf/guards/csrf.guard';
import { ToDoList } from './entities/to-do-list.entity';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('to-do-list')
export class ToDoListController {
  constructor(private readonly toDoListService: ToDoListService) {}

  	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('create', ToDoList))
	@Post()
	create(@CurrentUser() user: User, @Body() createToDoListDto: CreateToDoListDto) {
		return this.toDoListService.create(user.companyId, user.id, createToDoListDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', ToDoList))
	@Get()
	paginate(
		@CurrentUser() user: User, // <- get the decoded JWT directly
		@Query('page') page = 1,
		@Query('limit') limit = 10,
		@Query('search') search?: string,
	) {
		const companyId = user.companyId; // already decoded
		const userId = user.id;

		// return {companyId, userId}

		// Ensure numeric values
		const pageNum = Math.max(1, Number(page));
		const limitNum = Math.max(1, Number(limit));

		return this.toDoListService.paginate(companyId, userId, pageNum, limitNum, search);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('update', ToDoList))
	@Patch('finish/:id')
	finish(@Param('id') id: string, @CurrentUser() user: User, @Body() updateToDoListDto: UpdateToDoListDto) {
		return this.toDoListService.finish(id, user, updateToDoListDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('update', ToDoList))
	@Patch(':id')
	update(@Param('id') id: string, @CurrentUser() user: User, @Body() updateToDoListDto: UpdateToDoListDto) {
		return this.toDoListService.update(id, user, updateToDoListDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('delete', ToDoList))
	@Delete(':id')
	remove(@Param('id') id: string, @CurrentUser() user: User) {
		return this.toDoListService.remove(id, user);
	}
}
