import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
	constructor(
		@InjectRepository(Role)
		private readonly roleRepo: Repository<Role>,
	) {}

	// create(createRoleDto: CreateRoleDto) {
	// 	return 'This action adds a new role';
	// }

	findAll() {
		return this.roleRepo.find();
	}

	async findOne(id: string): Promise<Role> {
		const role = await this.roleRepo.findOneBy({ id });
		if (!role) {
			throw new NotFoundException(`Role with id ${id} not found`);
		}
		return role;
	}

	async findOneByName(name: string): Promise<Role | null> {
		return this.roleRepo.findOne({ where: { name } });
	}

	// update(id: number, updateRoleDto: UpdateRoleDto) {
	// 	return `This action updates a #${id} role`;
	// }

	// remove(id: number) {
	// 	return `This action removes a #${id} role`;
	// }
}
