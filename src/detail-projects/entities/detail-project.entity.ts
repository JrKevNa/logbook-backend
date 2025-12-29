import { Company } from "src/companies/entities/company.entity";
import { Project } from "src/projects/entities/project.entity";
import { User } from "src/users/entities/user.entity";
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class DetailProject {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @ManyToOne(() => Project, (project) => project.detailProjects)
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'project_id' })
    projectId: string;

    @Column({ name: 'is_done', type: 'boolean', default: false })
    isDone: boolean;

    @Column({ name: 'activity', type: 'varchar' })
    activity: string;

    @Column({ name: 'request_date', type: 'date' })
    requestDate: Date;

    // worked_by FK (User)
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'worked_by' })
    workedBy: User;

    @Column({ name: 'worked_by' })
    workedById: string;

    // requested_by VARCHAR (not FK)
    @Column({ name: 'requested_by', type: 'varchar' })
    requestedBy: string;
    
    @Column({ name: 'note', type: 'text', nullable: true })
    note: string;

    @Exclude()
    @ManyToOne(() => Company, (company) => company.detailProjects)
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

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}
