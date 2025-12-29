import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { PoliciesGuard } from 'src/casl/guards/policies.guard';
import { CsrfGuard } from 'src/csrf/guards/csrf.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { Role } from './entities/role.entity';

@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	// @Post()
	// create(@Body() createRoleDto: CreateRoleDto) {
	// 	return this.rolesService.create(createRoleDto);
	// }

	@UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	@CheckPolicies((ability: AppAbility) => ability.can('read', Role))
	@Get()
	findAll() {
		return this.rolesService.findAll();
	}

	// @Get(':id')
	// findOne(@Param('id') id: string) {
	// 	return this.rolesService.findOne(id);
	// }

	// @Patch(':id')
	// update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
	// 	return this.rolesService.update(+id, updateRoleDto);
	// }

	// @Delete(':id')
	// remove(@Param('id') id: string) {
	// 	return this.rolesService.remove(+id);
	// }
}
