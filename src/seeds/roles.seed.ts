// src/seeds/roles.seed.ts
import { AppDataSource } from '../data-source';
import { Role } from '../roles/entities/role.entity';

async function main() {
    await AppDataSource.initialize();
    const rolesRepo = AppDataSource.getRepository(Role);

    const predefinedRoles = ['admin', 'user'];

    for (const name of predefinedRoles) {
        const existing = await rolesRepo.findOne({ where: { name } });
        if (!existing) {
            await rolesRepo.save(rolesRepo.create({ name }));
        }
    }

    console.log('✅ Roles seeded');
    await AppDataSource.destroy();
}

main().catch(err => console.error(err));