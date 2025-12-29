import { Company } from "src/companies/entities/company.entity";
import { Role } from "../../roles/entities/role.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "src/user-roles/entities/user-role.entity";
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    nik: string;

    @Column({ unique: true })
    email: string;

    @Exclude()
    @Column()
    password: string;

    // @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true })
    // roles: Role[];

    // Non-persistent roles array (coming from jwt)
    roles?: string[];

    @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true })
    userRoles: UserRole[];

    @ManyToOne(() => Company, (company) => company.users)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Exclude()
    @Column({ name: 'company_id' })
    companyId: string;
}
