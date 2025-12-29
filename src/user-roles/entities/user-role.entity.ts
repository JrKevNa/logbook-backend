import { Role } from "../../roles/entities/role.entity";
import { User } from "../../users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from 'class-transformer';

@Entity('user_roles')
export class UserRole {
    @Exclude()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.userRoles)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Exclude()
    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Exclude()
    @Column({ name: 'role_id' })
    roleId: string;

    @CreateDateColumn()
    assignedAt: Date;
}
