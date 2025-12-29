import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { CsrfGuard } from 'src/csrf/guards/csrf.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Project } from './entities/project.entity';
import { User } from 'src/users/entities/user.entity';

@Controller('projects')
export class ProjectsController {
	constructor(private readonly projectsService: ProjectsService) {}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('create', Project))
	@Post()
	create(@CurrentUser() user: User, @Body() createProjectDto: CreateProjectDto) {
		return this.projectsService.create(user.companyId, user.id, createProjectDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', Project))
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

		return this.projectsService.paginate(companyId, userId, pageNum, limitNum, search);
	}

	@Get()
	findAll() {
		return this.projectsService.findAll();
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', Project))
	@Get(':id')
	findOne(@Param('id') id: string, @CurrentUser() user: User) {
		const companyId = user.companyId;
		return this.projectsService.findOne(id, companyId);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('update', Project))
	@Patch('finish/:id')
	finish(@Param('id') id: string, @CurrentUser() user: User, @Body() updateToDoListDto: UpdateProjectDto) {
		return this.projectsService.finish(id, user, updateToDoListDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('update', Project))
	@Patch(':id')
	update(@Param('id') id: string,  @CurrentUser() user: User, @Body() updateProjectDto: UpdateProjectDto) {
		return this.projectsService.update(id, user, updateProjectDto);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('delete', Project))
	@Delete(':id')
	remove(@Param('id') id: string, @CurrentUser() user: User) {
		return this.projectsService.remove(id, user);
	}
}
