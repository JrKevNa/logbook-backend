import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithCookies extends Request {
    cookies: Record<string, string>;
}

@Injectable()
export class CsrfGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<RequestWithCookies>();

        const csrfHeader = req.headers['x-csrf-token'];
        const csrfCookie = req.cookies['csrfToken'];
        const authHeader = req.headers['authorization'];

        const hasCsrfHeader = typeof csrfHeader === 'string' && csrfHeader.trim().length > 0;
        const hasCsrfCookie = typeof csrfCookie === 'string' && csrfCookie.trim().length > 0;

        // Case 1: browser request (has cookie AND header) → enforce CSRF
        if (hasCsrfCookie || hasCsrfHeader) {
            // console.log("csrfHeader:", csrfHeader);
            // console.log("csrfCookie:", csrfCookie);
            // console.log("authHeader:", authHeader);
            // console.log("hasCsrfHeader:", hasCsrfHeader);
            // console.log("hasCsrfCookie:", hasCsrfCookie);

            if (!hasCsrfHeader || csrfHeader !== csrfCookie) {
                throw new UnauthorizedException('CSRF token mismatch');
            }
            return true;
        }

        // Case 2: mobile/API request (no CSRF cookie but has Authorization) → allow
        if (authHeader) {
            return true;
        }

        // Case 3: neither CSRF nor Authorization → reject
        throw new UnauthorizedException('Missing CSRF token or Authorization header');
    }
}