import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    handleRequest(err, user, info, context: ExecutionContext) {
        // Always allow the request to continue
        const req = context.switchToHttp().getRequest();
        req.authInfo = info; // attach info to request
        return user; // may be undefined if not found
    }
}