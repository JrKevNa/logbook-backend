import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UnauthorizedException, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Request as ExpressRequest } from 'express';
import type { Response } from 'express';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import winston from 'winston';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { CsrfGuard } from '../csrf/guards/csrf.guard';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { User } from 'src/users/entities/user.entity';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { REFRESH_TOKEN_COOKIE, ACCESS_TOKEN_COOKIE, CSRF_COOKIE, TOKEN_EXPIRY } from './config/cookies.config';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';

const logger = winston.createLogger({
	transports: [
			new winston.transports.File({
			filename: 'logs/auth.log',
			level: 'info',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
			),
		}),
	],
});


interface RequestWithCookies extends ExpressRequest {
  	cookies: Record<string, string>;
}

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,

		private readonly config: ConfigService,
	) {}

	@Get('google/login')
	@UseGuards(GoogleAuthGuard)
	googleLogin() {

	}

	@UseGuards(GoogleAuthGuard)
	@Get('google/callback')
	async googleCallback(@Req() req: any, @Res() res: Response) {
		const email = req.user?.email;
		console.log('current user email: ', email)

		// 1. Check if user exists
		const user = await this.usersService.findByEmail(email);

		if (!user) {
			// Not registered → redirect popup to frontend register page
			return res.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/register`);
		}

		// 2. User exists → generate tokens
		const { accessToken, refreshToken } = await this.authService.generateTokens(user);

		// 3. Set cookies for frontend to read
		res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE);
		res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE);
		const csrfToken = randomUUID();
		res.cookie('csrfToken', csrfToken, { httpOnly: false });

		// 4. Redirect popup to a "success page" that frontend knows
		res.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/oauth-success`);
		return { user, accessToken, refreshToken };
	}

	@Post('register')
	async register(@Body() dto: RegisterAuthDto) {
		return this.authService.register(dto);
	}

	@Post('google/mobile/login')
	async googleMobileLogin(@Body() body: { idToken: string }) {
		return this.authService.loginWithGoogleIdToken(body.idToken);
	}

	// @Post('login')
	// async login(
	// 	@Body() dto: LoginAuthDto,
	// 	@Res({ passthrough: true }) res: Response
	// ) {
	// 	const { user, accessToken, refreshToken } = await this.authService.login(dto);

	// 	// Set HTTP-only cookies for web
	// 	// res.cookie('accessToken', accessToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 30 * 1000 });
	// 	// res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

	// 	res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE);
	// 	res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE);

	// 	const csrfToken = randomUUID();
	// 	res.cookie('csrfToken', csrfToken, { 
	// 		httpOnly: false 
	// 	});

	// 	return { user, accessToken, refreshToken }; // optional return for mobile
	// }

	@Post('mobile-refresh')
	async mobileRefresh(@Body() body: { refreshToken: string }) {
		if (!body.refreshToken) {
			throw new UnauthorizedException('No refresh token');
		}

		const payload = await this.jwtService.verifyAsync(body.refreshToken, {
			secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
		});

		const newAccessToken = this.jwtService.sign(
			{
				id: payload.id,
				username: payload.username,
				email: payload.email,
				companyId: payload.companyId,
				roles: payload.roles,
			},
			{
				secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
				expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
			},
		);

		return { accessToken: newAccessToken };
	}

	@Post('refresh-token')
		async refreshToken(
		@Req() req: RequestWithCookies,
		@Body() body?: { refreshToken?: string },
		@Res({ passthrough: true }) res?: Response
	) {
		// 1️⃣ Get token
		const refreshToken = req.cookies?.refreshToken || body?.refreshToken;
		if (!refreshToken) throw new UnauthorizedException('No refresh token');

		// 2️⃣ Verify token
		const payload = await this.jwtService.verifyAsync(refreshToken, {
			secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
		});

		// 3️⃣ Generate new access token
		const newAccessToken = this.jwtService.sign(
			{
				id: payload.id,
				username: payload.username,
				email: payload.email,
				companyId: payload.companyId,
				roles: payload.roles,
			},
			{ secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: TOKEN_EXPIRY.access }
		);

		// 4️⃣ Set cookies (only for web)
		if (res) {
			res.cookie('accessToken', newAccessToken, ACCESS_TOKEN_COOKIE);

			const csrfToken = randomUUID();
			res.cookie('csrfToken', csrfToken, CSRF_COOKIE);
		}

		// 5️⃣ Return token (for mobile)
		return { accessToken: newAccessToken };
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('me')
	async me(@CurrentUser() user: User) {
		// return { user };
		const payload = await this.usersService.findUserById(user.id);

		// // Build CASL ability for the user
		// const ability = await this.caslAbilityFactory.createForUser(payload); // pass payload or full user

		// // Convert ability rules to a serializable format
		// const abilities = ability.rules.map(rule => ({
		// 	actions: rule.action,
		// 	subject: typeof rule.subject === 'function' ? rule.subject.name : rule.subject,
		// 	conditions: rule.conditions ?? null,
		// }));

		// return { user: payload, abilities: abilities};
		return { user: payload };
	}
	
	@Post('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('accessToken');
		res.clearCookie('csrfToken');
		res.clearCookie('refreshToken');
		return { message: 'Logged out successfully' };
	}

	// @UseGuards(AuthGuard('jwt'), PoliciesGuard, CsrfGuard)
	// @CheckPolicies((ability: AppAbility) => ability.can('update', User))
	// @Post('change-password')
	// async changePassword(@CurrentUser() user: User, @Body() body: ChangePasswordDto, @Res({ passthrough: true }) res: Response) {
	// 	return this.authService.changePassword(user.id, body);
	// }


	// @Post()
	// create(@Body() createAuthDto: CreateAuthDto) {
	// 	return this.authService.create(createAuthDto);
	// }

	@Get()
	findAll() {
		return this.authService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.authService.findOne(+id);
	}

	// @Patch(':id')
	// update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
	// 	return this.authService.update(+id, updateAuthDto);
	// }

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.authService.remove(+id);
  	}
}
