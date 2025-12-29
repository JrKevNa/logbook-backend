import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly config: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    const cookieToken = req?.cookies?.accessToken;
                    if (cookieToken) {
                        (req as any)._authMethod = 'cookie';
                        return cookieToken;
                    }

                    const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
                    if (headerToken) {
                        (req as any)._authMethod = 'header';
                        return headerToken;
                    }

                    return null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow('JWT_ACCESS_SECRET'),
            passReqToCallback: true,   // <-- THE CORRECT PLACE
        });
    }

    async validate(req: Request, payload: any) {
        // console.log("Authenticated via:", (req as any)._authMethod);

        return {
            id: payload.id,
            username: payload.username,
            email: payload.email,
            companyId: payload.companyId,
            roles: payload.roles
        };
    }
}