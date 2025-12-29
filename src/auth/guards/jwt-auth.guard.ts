import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { jwtConstants } from "../constants";
import { JwtService } from "@nestjs/jwt";
import winston from "winston";
import { ConfigService } from "@nestjs/config";

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


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        logger.info(`log`);

        const request = context.switchToHttp().getRequest();

        // 1️⃣ Try to get token from cookie
        let token = request.cookies?.['accessToken'];
        // console.log('token from cookies', token)

        logger.info(`Token from cookie: ${token || 'not found'}`);

        // 2️⃣ Fallback to Authorization header (for mobile)
        if (!token) {
            const authHeader = request.headers['authorization'];
            // console.log('authHeader', authHeader)

            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            throw new UnauthorizedException('No JWT token found');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
            });
            request['user'] = payload; // attach user info for handlers
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return true;
    }
}