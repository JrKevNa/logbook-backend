import { Exclude } from "class-transformer";
import { Company } from "src/companies/entities/company.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ToDoList {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    @Column({ type: 'text' })
    activity: string;

    @Column({ name: 'is_done', default: false, nullable: true })
    isDone: boolean;

    @Exclude()
    @ManyToOne(() => Company, (company) => company.toDoList)
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
}
