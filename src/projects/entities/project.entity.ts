import { Company } from "src/companies/entities/company.entity";
import { DetailProject } from "src/detail-projects/entities/detail-project.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Exclude } from 'class-transformer';

@Entity()
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    @Column({ type: 'varchar' })
    name: string;

    @ManyToOne(() => User, { eager: true }) // eager optional
    @JoinColumn({ name: 'worked_by' })
    workedBy: User;

    @Column({ name: 'worked_by', nullable: true })
    workedById: string;

    @Column({ name: 'requested_by', type: 'varchar', nullable: true })
    requestedBy: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({ name: 'is_done', default: false, nullable: true })
    isDone: boolean;

    @Exclude()
    @ManyToOne(() => Company, (company) => company.projects)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Exclude()
    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => User, { eager: true }) // eager optional
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @Column({ name: 'created_by', nullable: true })
    createdById: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'updated_by' })
    updatedBy: User;

    @Column({ name: 'updated_by', nullable: true })
    updatedById: string;

    @OneToMany(() => DetailProject, (dp) => dp.project)
    detailProjects: DetailProject[];
}
