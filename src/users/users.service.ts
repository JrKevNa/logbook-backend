import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { RolesService } from 'src/roles/roles.service';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
	constructor(
		// @InjectRepository(User)
		// private readonly userRepo: Repository<User>,
		private readonly userRepo: UsersRepository,
		private readonly rolesService: RolesService,
		private readonly userRolesService: UserRolesService,

		private readonly caslAbilityFactory: CaslAbilityFactory, 
	) {}

	createUserFromRegister(createUserDto: CreateUserDto) {
		const item = this.userRepo.createUserFromRegister(createUserDto); // converts DTO to entity
		return this.userRepo.saveUserFromRegister(item); // saves to Postgres
	}

	create(createUserDto: CreateUserDto) {
		const item = this.userRepo.create(createUserDto); // converts DTO to entity
		return this.userRepo.save(item); // saves to Postgres
	}

	async createInternalUser(companyId: string, createUserDto: CreateUserDto) {
		// // 1️⃣ Hash password
		// const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

		// 2️⃣ Create the user entity
		const user = this.userRepo.create({
			nik: createUserDto.nik,
			username: createUserDto.username,
			email: createUserDto.email,
			// password: hashedPassword,
		});

		// 3️⃣ Save user first
		const savedUser = await this.userRepo.save(user);

		// 4️⃣ Assign role if provided
		if (createUserDto.roleId) {
			const role = await this.rolesService.findOne(createUserDto.roleId);
			if (!role) {
				throw new NotFoundException('Role not found');
			}

			await this.userRolesService.assignRole(savedUser, role);
		}

		// 5️⃣ Return saved user
		return savedUser;
	}

	async findAll(user: User): Promise<User[]> {
		// Check if user is admin
		
		const fullUser = await this.findUserById(user.id);

		// Determine if the user is an admin
    	const isAdmin = fullUser.userRoles?.some(ur => ur.role.name === 'admin') ?? false;

		const where: any = {
			companyId: user.companyId, // everyone can only see users from their own company
		};

		if (!isAdmin) {
			// Non-admin users only see themselves
			where.id = user.id;
		}

		return this.userRepo.find({
			where,
			relations: ['company', 'userRoles', 'userRoles.role'],
		});
	}

	async paginate(
		companyId: string,
		userId: string,
		page: number,
		limit: number,
		search?: string
	) {
		// return { companyId }

		const query = this.userRepo
			.createQueryBuilder('user')
			.where('user.company_id = :companyId', { companyId })
			.leftJoinAndSelect('user.userRoles', 'userRole')       // 👈 join userRoles
			.leftJoinAndSelect('userRole.role', 'role');           // 👈 join nested role
		if (search) {
			query.andWhere(
				`(LOWER(user.username) LIKE LOWER(:search) 
					OR CAST(user.email AS TEXT) LIKE :search`,
				{ search: `%${search}%` }
			);
		}

		// Count with the same filters
		const total = await query.getCount();

		const users = await query
			.orderBy('user.username', 'ASC') // optional: order by log date
			.skip((page - 1) * limit)
			.take(limit)
			.getMany();

		return {
			users,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		};
	}

	async findByEmail(email: string): Promise<User | null> {
		if (!email) return null
		return this.userRepo.findOne({ 
			where: { email },
			relations: ['company', 'userRoles', 'userRoles.role'],
		});
	}

	async findUserById(id: string) {
		const user = await this.userRepo.findOne({
			where: { id },
			relations: ['company', 'userRoles', 'userRoles.role'],
		});

		if (!user) {
			throw new NotFoundException(`User not found`);
		}

		return user;
	}

	async findOne(id: string, companyId: string) {
		const user = await this.userRepo.findOne({
			where: { id, companyId },
			relations: ['company'],
		});

		if (!user) {
			throw new NotFoundException(`User not found`);
		}

		return user;
	}

	// async update(id: string, companyId: string, updateDto: UpdateUserDto) {
	// 	const result = await this.userRepo.update(
	// 		{ id, companyId }, // 👈 filter by both id and companyId
	// 		updateDto,
	// 	);

	// 	if (result.affected === 0) {
	// 		throw new NotFoundException(`User not found or not owned by this company`);
	// 	}

	// 	return this.findOne(id, companyId);
	// }

	async update(id: string, currentUser: User, updateDto: UpdateUserDto) {
		// 1️⃣ Load the target user
		const targetUser = await this.userRepo.findOne({
			where: { id, companyId: currentUser.companyId },
			relations: ['userRoles'],
		});
		if (!targetUser) throw new NotFoundException('User not found or not owned by your company');

		// 2️⃣ CASL check
		const ability = await this.caslAbilityFactory.createForUser(currentUser);
		ForbiddenError.from(ability).throwUnlessCan('update', targetUser);

		// 3️⃣ Apply updates
		// const { roleId, password, ...rest } = updateDto;
		const { roleId, ...rest } = updateDto;
		const userUpdates: any = { ...rest };
		// if (password) userUpdates.password = await bcrypt.hash(password, 10);

		await this.userRepo.manager.transaction(async (manager) => {
			if (Object.keys(userUpdates).length > 0) {
				await manager.update('users', { id }, userUpdates);
			}

			if (roleId) {
				const userRoleRepo = manager.getRepository('user_roles');
				if (targetUser.userRoles?.length > 0) {
					await userRoleRepo.update(
						{ id: targetUser.userRoles[0].id },
						{ roleId, assignedAt: new Date() }
					);
				} else {
					await userRoleRepo.insert({
						user: { id },
						role: { id: roleId },
						assignedAt: new Date()
					});
				}
			}
		});

		return this.findOne(id, currentUser.companyId);
	}

	// async updatePassword(id: string, hashedPassword: string) {
	// 	return this.userRepo.updateWithTenant(
	// 		{ id },
	// 		{ password: hashedPassword },
	// 	);
	// }


	remove(id: string) {
		return `This action removes a #${id} user`;
	}
}
