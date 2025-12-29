import { Company } from 'src/companies/entities/company.entity';
import { User } from 'src/users/entities/user.entity';
import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Logbook {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    @Column({ type: 'date' })
    logDate: Date;

    @Column({ type: 'int' })
    durationNumber: number;

    @Column({ type: 'varchar', length: 20 })
    durationUnit: string;

    @Column({ type: 'text' })
    activity: string;

    @Exclude()
    @ManyToOne(() => Company, (company) => company.logbooks)
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