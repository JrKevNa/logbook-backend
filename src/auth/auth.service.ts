import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcryptjs';
import { CompaniesService } from 'src/companies/companies.service';
import { RolesService } from 'src/roles/roles.service';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { jwtConstants } from './constants';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TOKEN_EXPIRY } from './config/cookies.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

	constructor(
		private readonly usersService: UsersService,
		private readonly companiesService: CompaniesService,
		private readonly rolesService: RolesService,
		private readonly userRolesService: UserRolesService,
		private readonly jwtService: JwtService,

		private readonly config: ConfigService,
	) {}
	
	async register(dto: RegisterAuthDto) {
		// hash password
		// const hashed = await bcrypt.hash(dto.password, 10);
		// return this.usersService.create({ ...dto, password: hashed });

		// 1️⃣ Create the company
		const company = await this.companiesService.create({ name: dto.companyName });

		// 2️⃣ Hash the password
		const hashedPassword = await bcrypt.hash(dto.password, 10);

		// 3️⃣ Create the user
		const user = await this.usersService.create({
			username: dto.username,
			email: dto.email,
			nik: dto.nik,
			password: hashedPassword,
			companyId: company.id, // link user to company
		});
		// console.log("user id: ", user.id);

		// 4️⃣ Assign admin role
		const adminRole = await this.rolesService.findOneByName('admin');

		if (!adminRole) {
			throw new NotFoundException('Admin role not found. Make sure it exists in the database.');
		}

		// console.log("adminRole id: ", adminRole.id);

		await this.userRolesService.assignRole(user, adminRole);

		return user;
	}

	async login(dto: LoginAuthDto) {
		const user = await this.usersService.findByEmail(dto.email);
		if (!user) throw new UnauthorizedException();

		const valid = await bcrypt.compare(dto.password, user.password);
		if (!valid) throw new UnauthorizedException();

		// Map roles
		const roles = user.userRoles?.map(ur => ur.role.name) ?? [];

		// Include roles in JWT payload
		const payload = {
			id: user.id,
			username: user.username,
			email: user.email,
			companyId: user.companyId,
			roles, // ✅ added
		};

		const accessToken = this.jwtService.sign(payload, { 
			secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
			expiresIn: TOKEN_EXPIRY.access,
		});

		const refreshToken = this.jwtService.sign(payload, { 
			secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
			expiresIn: TOKEN_EXPIRY.refresh,
		});

		return { 
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				company: await this.companiesService.findOne(user.companyId),
				roles, // optional: return roles in response too
			},
			accessToken, 
			refreshToken 
		};
	}

	// async refresh(refreshToken: string): Promise<{ accessToken: string }> {
	// 	const payload = await this.jwtService.verifyAsync(refreshToken, { secret: jwtConstants.refreshSecret });
	// 	const user = await this.usersService.findUserById(payload.id);
		
	// 	if (!user) throw new UnauthorizedException('User not found');

	// 	const newAccessToken = await this.jwtService.signAsync(
	// 		{ id: user.id, username: user.username, email: user.email, companyId: user.companyId },
	// 		{ secret: jwtConstants.secret, expiresIn: TOKEN_EXPIRY.access }
	// 	);

	// 	return { accessToken: newAccessToken };
	// }

	async changePassword(id: string, body: ChangePasswordDto) {
		const user = await this.usersService.findUserById(id);
		if (!user) throw new BadRequestException('User not found');

		const isMatch = await bcrypt.compare(body.oldPassword, user.password);
		if (!isMatch) throw new BadRequestException('Old password is incorrect');

		const hashedNew = await bcrypt.hash(body.newPassword, 10);
		await this.usersService.updatePassword(id, hashedNew);
	}

	// create(createAuthDto: CreateAuthDto) {
	// 	return 'This action adds a new auth';
	// }

	findAll() {
		return `This action returns all auth`;
	}

	findOne(id: number) {
		return `This action returns a #${id} auth`;
	}

	// update(id: number, updateAuthDto: UpdateAuthDto) {
	// 	return `This action updates a #${id} auth`;
	// }

	remove(id: number) {
		return `This action removes a #${id} auth`;
	}
}
