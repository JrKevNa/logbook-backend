import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DetailProjectsService } from './detail-projects.service';
import { CreateDetailProjectDto } from './dto/create-detail-project.dto';
import { UpdateDetailProjectDto } from './dto/update-detail-project.dto';
import { DetailProject } from './entities/detail-project.entity';
import { AuthGuard } from '@nestjs/passport';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { CsrfGuard } from 'src/csrf/guards/csrf.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('detail-projects')
export class DetailProjectsController {
	constructor(private readonly detailProjectsService: DetailProjectsService) {}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('create', DetailProject))
	@Post()
	create(@CurrentUser() user: User, @Body() createDetailProjectDto: CreateDetailProjectDto) {
		return this.detailProjectsService.create(user.companyId, user.id, createDetailProjectDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', DetailProject))
	@Get(':id')
	paginate(
		@Param('id') id: string,
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

		return this.detailProjectsService.paginate(id, companyId, userId, pageNum, limitNum, search);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('update', DetailProject))
	@Patch('finish/:id')
	finish(@Param('id') id: string, @CurrentUser() user: User, @Body() updateDetailProjectDto: UpdateDetailProjectDto) {
		return this.detailProjectsService.finish(id, user, updateDetailProjectDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('update', DetailProject))
	@Patch(':id')
	update(@Param('id') id: string,  @CurrentUser() user: User, @Body() updateDetailProjectDto: UpdateDetailProjectDto) {
		return this.detailProjectsService.update(id, user, updateDetailProjectDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('delete', DetailProject))
	@Delete(':id')
	remove(@Param('id') id: string, @CurrentUser() user: User) {
		return this.detailProjectsService.remove(id, user);
	}
}
