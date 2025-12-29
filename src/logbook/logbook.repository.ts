import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Logbook } from "./entities/logbook.entity";
import { DeepPartial, DeleteResult, FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { TenantContext } from "src/common/tenant/tenant.context";
import { TenantRepository } from "src/common/tenant/tenant.repository";

@Injectable()
export class LogbookRepository extends TenantRepository<Logbook> {
    constructor(
        @InjectRepository(Logbook)
        private readonly logbookRepo: Repository<Logbook>,
    ) {
        super(logbookRepo); // pass to base class
    }

    // Add model-specific methods here if needed
}

// @Injectable()
// export class LogbookRepository {
//     constructor(
//         @InjectRepository(Logbook)
//         private readonly repo: Repository<Logbook>,
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

//     create(data: DeepPartial<Omit<Logbook, 'companyId'>>): Logbook {
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

//     find(options?: FindManyOptions<Logbook>) {
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

//     save(entity: Logbook) {
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