import {
	CanActivate,
	ExecutionContext,
	Injectable,
	ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../casl-ability.factory';
import { AppAbility } from '../casl-ability.factory';
import { CHECK_POLICIES_KEY, PolicyHandler } from '../decorators/check-policies.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private caslAbilityFactory: CaslAbilityFactory,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const policyHandlers =
		this.reflector.get<PolicyHandler[]>(
			CHECK_POLICIES_KEY,
			context.getHandler(),
		) || [];

		const request = context.switchToHttp().getRequest();
		const user = request.user;
		const ability = await this.caslAbilityFactory.createForUser(user);

		const canAccess = policyHandlers.every((handler) =>
			this.execPolicyHandler(handler, ability),
		);

		if (!canAccess) {
			throw new ForbiddenException('You do not have permission.');
		}

		return true;
	}

	private execPolicyHandler(handler: PolicyHandler, ability: AppAbility): boolean {
		return typeof handler === 'function' ? handler(ability) : handler.handle(ability);
	}
}
