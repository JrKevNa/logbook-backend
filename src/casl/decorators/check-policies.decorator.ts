import { SetMetadata } from '@nestjs/common';
import { AppAbility } from '../casl-ability.factory'; // adjust path as needed

// Function-based handler
export type PolicyHandlerCallback = (ability: AppAbility) => boolean;

// Class-based handler
export interface IPolicyHandler {
  	handle(ability: AppAbility): boolean;
}

// Allow both types
export type PolicyHandlerType = PolicyHandler | PolicyHandlerCallback;

// Union type
export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandlerType[]) =>
    SetMetadata(CHECK_POLICIES_KEY, handlers);
