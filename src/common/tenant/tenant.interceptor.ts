import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
	intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
		const req = ctx.switchToHttp().getRequest();
		const user = req.user;

		// ✅ Public / unauthenticated routes
		if (!user) {
			console.log("public")
			console.log(req.method, req.url);
			return next.handle();
		}

		if (!user.companyId) {
			throw new Error('Authenticated user missing companyId');
		}

		return new Observable((subscriber) => {
			TenantContext.run(user.companyId, () => {
				console.log("return new Observable")
				console.log(req.method, req.url);
				next.handle().subscribe(subscriber);
			});
		});
	}
}