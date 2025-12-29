import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const user = req.user as any;

		if (!user?.companyId) {
			throw new Error('Authenticated user missing companyId');
		}

		TenantContext.run(user.companyId, () => next());
	}
}