import { Injectable } from '@nestjs/common';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UserRolesService {
	constructor(
		@InjectRepository(UserRole)
		private readonly userRolesRepo: Repository<UserRole>,
	) {}

	async assignRole(user: User, role: Role): Promise<UserRole> {
		// Check if the role is already assigned
		const existing = await this.userRolesRepo.findOne({
			where: { user: { id: user.id }, role: { id: role.id } },
		});
		
		if (existing) {
			// console.log("already exists")
			return existing; // already assigned
		}
		// console.log("not yet exists")

		const userRole = this.userRolesRepo.create({ user, role });
		return this.userRolesRepo.save(userRole);
	}

	create(createUserRoleDto: CreateUserRoleDto) {
		return 'This action adds a new userRole';
	}

	findAll() {
		return `This action returns all userRoles`;
	}

	findOne(id: number) {
		return `This action returns a #${id} userRole`;
	}

	update(id: number, updateUserRoleDto: UpdateUserRoleDto) {
		return `This action updates a #${id} userRole`;
	}

	remove(id: number) {
		return `This action removes a #${id} userRole`;
	}
}
