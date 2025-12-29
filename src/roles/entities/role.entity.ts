import { UserRole } from "src/user-roles/entities/user-role.entity";
import { User } from "../../users/entities/user.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from 'class-transformer';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string; // e.g., 'admin', 'manager', 'clerk'

    @OneToMany(() => UserRole, (userRole) => userRole.role)
    users: UserRole[];
}
