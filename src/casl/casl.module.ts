import { forwardRef, Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { PoliciesGuard } from './guards/policies.guard';
import { UsersModule } from '../users/users.module';

@Module({
    // imports: [ forwardRef(() => UsersModule) ],
    // imports: [UsersModule],
    providers: [CaslAbilityFactory, PoliciesGuard],
    exports: [CaslAbilityFactory, PoliciesGuard],
})
export class CaslModule {}