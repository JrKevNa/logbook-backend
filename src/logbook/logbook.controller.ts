import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CsrfGuard } from 'src/csrf/guards/csrf.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { Logbook } from './entities/logbook.entity';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { User } from 'src/users/entities/user.entity';

@Controller('logbook')
export class LogbookController {
	constructor(private readonly logbookService: LogbookService) {}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('create', Logbook))
	@Post()
	create(@CurrentUser() user: User, @Body() createLogbookDto: CreateLogbookDto) {
		return this.logbookService.create(user, createLogbookDto);
	}

	// @UseGuards(AuthGuard('jwt'))
	// @Get()
	// findAll(@CurrentUser() user: User) {
	// 	return this.logbookService.findAll(user.companyId);
	// }

	// @UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', Logbook))
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

		return this.logbookService.paginate(companyId, userId, pageNum, limitNum, search);
	}

	// @Get('daily')
	// async getGroupedLogs(@Query() query: any) {
	// 	console.log(query);
	// 	return query;
	// }

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', Logbook))
	@Get('daily')
	async getGroupedLogs(
		@CurrentUser() user: User,
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
		@Query('userId') userId?: string,
	) {
		// return ({startDate, endDate})
		return this.logbookService.getLogsGroupedByDay(user, startDate, endDate, userId);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', Logbook))
	@Get('user')
	async getGroupedUserLogs(
		@CurrentUser() user: User,
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
		@Query('userId') userId?: string,
	) {
		// return ({startDate, endDate})
		return this.logbookService.getLogsGroupedByUser(user, startDate, endDate, userId);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('update', Logbook))
	@Patch(':id')
	update(@Param('id') id: string, @CurrentUser() user: User, @Body() updateLogbookDto: UpdateLogbookDto) {
		return this.logbookService.update(id, user, updateLogbookDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('delete', Logbook))
	@Delete(':id')
	remove(@Param('id') id: string, @CurrentUser() user: User) {
		return this.logbookService.remove(id, user);
	}
}
