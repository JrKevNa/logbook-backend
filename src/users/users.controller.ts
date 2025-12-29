import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { CsrfGuard } from 'src/csrf/guards/csrf.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}


	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('create', User))
	@Post()
	create(@CurrentUser() user: User, @Body() createUserDto: CreateUserDto) {
		return this.usersService.createInternalUser(user.companyId, createUserDto);
	}

	// @UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', User))
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

		return this.usersService.paginate(companyId, userId, pageNum, limitNum, search);
	}
	

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', User))
	@Get('all')
	findAll(@CurrentUser() user: User) {
		return this.usersService.findAll(user);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', User))
	@Get(':id')
	findOne(@Param('id') id: string, @CurrentUser() user: User) {
		return this.usersService.findOne(id, user.companyId);
	}

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('update', User))
	@Patch(':id')
	update(@Param('id') id: string, @CurrentUser() currentUser: User, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(id, currentUser, updateUserDto);
	}

	// @Delete(':id')
	// remove(@Param('id') id: string) {
	// 	return this.usersService.remove(id);
	// }
}
