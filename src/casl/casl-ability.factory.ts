// casl-ability.factory.ts
import { Injectable } from '@nestjs/common';
import { AbilityBuilder, createMongoAbility, MongoAbility, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Logbook } from 'src/logbook/entities/logbook.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { ToDoList } from 'src/to-do-list/entities/to-do-list.entity';
import { Project } from 'src/projects/entities/project.entity';
import { DetailProject } from 'src/detail-projects/entities/detail-project.entity';
import { Role } from 'src/roles/entities/role.entity';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subjects = InferSubjects<typeof User | typeof Role | typeof Logbook | typeof ToDoList | typeof Project | typeof DetailProject> | 'all'; // 👈 use class types, not strings
export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
	async createForUser(fullUser: User & { roles?: string[] }): Promise<AppAbility> {
		const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

		if (!fullUser) return build();

		// Read roles directly from JWT payload
		const roles = fullUser.roles ?? [];

		// console.log('roles', roles)

		if (roles.includes('admin')) {
			// Admin can manage everything — but ONLY inside their company
			can('manage', User, { companyId: fullUser.companyId });
			can('manage', Logbook, { companyId: fullUser.companyId });
			can('manage', ToDoList, { companyId: fullUser.companyId });
			can('manage', Project, { companyId: fullUser.companyId });
			can('manage', DetailProject, { companyId: fullUser.companyId });
			can('read', Role );
		}

		else if (roles.includes('user')) {

			can('read', User, { id: fullUser.id, companyId: fullUser.companyId });
			can('update', User, { id: fullUser.id, companyId: fullUser.companyId });

			can('create', Logbook);
			can('read', Logbook, { createdById: fullUser.id, companyId: fullUser.companyId });
			can('update', Logbook, { createdById: fullUser.id, companyId: fullUser.companyId });
			can('delete', Logbook, { createdById: fullUser.id, companyId: fullUser.companyId });

			can('create', ToDoList);
			can('read', ToDoList, { createdById: fullUser.id, companyId: fullUser.companyId });
			can('update', ToDoList, { createdById: fullUser.id, companyId: fullUser.companyId });
			can('delete', ToDoList, { createdById: fullUser.id, companyId: fullUser.companyId });

			// user can manage ONLY their company's data
			can('manage', Project, { companyId: fullUser.companyId });
			can('manage', DetailProject, { companyId: fullUser.companyId });
		}
		
		return build();
	}
}
