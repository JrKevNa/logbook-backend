import { DataSource } from 'typeorm';
import { Role } from './roles/entities/role.entity';
import { User } from './users/entities/user.entity';
import { UserRole } from './user-roles/entities/user-role.entity';
// import other entities if needed

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'yourpassword',
    database: 'inventory_db',
    entities: [Role, User, UserRole],
    synchronize: true, // optional
});