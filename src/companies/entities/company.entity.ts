// import { Allocation } from "src/allocations/entities/allocation.entity";
// import { Customer } from "src/customers/entities/customer.entity";
// import { InventoryItem } from "src/inventory-items/entities/inventory-item.entity";
// import { StockReceive } from "src/stock_receives/entities/stock_receive.entity";
import { DetailProject } from "src/detail-projects/entities/detail-project.entity";
import { Logbook } from "src/logbook/entities/logbook.entity";
import { Project } from "src/projects/entities/project.entity";
import { ToDoList } from "src/to-do-list/entities/to-do-list.entity";
import { User } from "src/users/entities/user.entity";
import { Exclude } from 'class-transformer';
// import { Vendor } from "src/vendors/entities/vendor.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'companies' }) // explicit table name in snake_case
export class Company {
    @Exclude()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => User, (user) => user.company)
    users: User[]

    @OneToMany(() => Logbook, (logbook) => logbook.company)
    logbooks: Logbook[]

    @OneToMany(() => DetailProject, (dp) => dp.company)
    detailProjects: DetailProject[];

    @OneToMany(() => Project, (dp) => dp.company)
    projects: Project[];

    @OneToMany(() => ToDoList, (dp) => dp.company)
    toDoList: ToDoList[];

    // @OneToMany(() => Vendor, (Vendor) => Vendor.company)
    // vendors: Vendor[]

    // @OneToMany(() => Customer, (Customer) => Customer.company)
    // customers: Customer[]

    // @OneToMany(() => StockReceive, (StockReceive) => StockReceive.company)
    // stockReceives: StockReceive[]

    // @OneToMany(() => Allocation, (Allocation) => Allocation.company)
    // allocations: Allocation[]
}
