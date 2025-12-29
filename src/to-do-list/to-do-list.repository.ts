import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, DeleteResult, FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { TenantContext } from "src/common/tenant/tenant.context";
import { ToDoList } from "./entities/to-do-list.entity";
import { TenantRepository } from "src/common/tenant/tenant.repository";

@Injectable()
export class ToDoListRepository extends TenantRepository<ToDoList> {
    constructor(
        @InjectRepository(ToDoList)
        private readonly toDoListRepo: Repository<ToDoList>,
    ) {
        super(toDoListRepo); // pass to base class
    }

    // Add model-specific methods here if needed
}


// @Injectable()
// export class ToDoListRepository {
//     constructor(
//         @InjectRepository(ToDoList)
//         private readonly repo: Repository<ToDoList>,
//     ) {}

//     private tenantWhere() {
//         const companyId = TenantContext.get();
//         if (!companyId) {
//             throw new Error('Tenant missing');
//         }
//         return { companyId };
//     }

//     private getCompanyId(): string {
//         const companyId = TenantContext.get();
//         if (!companyId) {
//             throw new Error('Tenant missing');
//         }
//         return companyId;
//     }

//     create(data: DeepPartial<Omit<ToDoList, 'companyId'>>): ToDoList {
//         const companyId = TenantContext.get();
//         if (!companyId) throw new Error('Tenant missing');

//         return this.repo.create({ ...data, companyId });
//     }

//     findOneById(id: string) {
//         return this.repo.findOne({
//             where: {
//                 id,
//                 ...this.tenantWhere(),
//             },
//         });
//     }

//     find(options?: FindManyOptions<ToDoList>) {
//         return this.repo.find({
//             ...options,
//             where: {
//                 ...this.tenantWhere(),
//                 ...(options?.where ?? {}),
//             },
//         });
//     }

//     createQueryBuilder(alias: string) {
//         const companyId = TenantContext.get();
//         if (!companyId) throw new Error('Tenant missing');

//         return this.repo
//             .createQueryBuilder(alias)
//             .andWhere(`${alias}.company_id = :companyId`, { companyId });
//     }

//     save(entity: ToDoList) {
//         // enforce tenant on writes too
//         entity.companyId = this.getCompanyId();
//         return this.repo.save(entity);
//     }

//     async deleteById(id: string): Promise<DeleteResult> {
//         const companyId = TenantContext.get();
//         if (!companyId) throw new Error('Tenant missing');

//         // tenant enforced automatically
//         return this.repo.delete({ id, companyId });
//     }
// }