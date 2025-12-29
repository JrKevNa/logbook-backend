import { Injectable } from "@nestjs/common";
import { DeepPartial, DeleteResult, FindManyOptions, FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository, SelectQueryBuilder, UpdateResult } from "typeorm";
import { TenantContext } from "./tenant.context";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";

@Injectable()
export abstract class TenantRepository<T extends { companyId: string }> {
    constructor(protected readonly repo: Repository<T>) {}

	protected tenantWhere(): Partial<T> {
		const companyId = TenantContext.get();
		if (!companyId) return {}; // 🔑 allow no-tenant queries
		return { companyId } as Partial<T>;
	}
	
    protected getCompanyId(): string {
        const companyId = TenantContext.get();
        if (!companyId) throw new Error('Tenant missing');
        return companyId;
    }

	create(data: DeepPartial<Omit<T, 'companyId'>>): T {
		const entity = this.repo.create({
			...data,
			companyId: this.getCompanyId(),
		} as unknown as DeepPartial<T>); // <-- type assertion
		return entity;
	}
	
    save(entity: T): Promise<T> {
        entity.companyId = this.getCompanyId(); // ✅ works now
        return this.repo.save(entity);
    }

	find(options?: FindManyOptions<T>): Promise<T[]> {
		return this.repo.find({
			...options,
			where: {
				...this.tenantWhere(),
				...(options?.where ?? {}),
			} as FindOptionsWhere<T>, // ✅ assert type
		});
	}
	
	findOne(options?: FindOneOptions<T>): Promise<T | null> {
		return this.repo.findOne({
			...options,
			where: {
				...this.tenantWhere(),
				...(options?.where ?? {}),
			} as FindOptionsWhere<T>,
		});
	}

	findOneById(id: string): Promise<T | null> {
		const where: FindOptionsWhere<T> = {
			id,
			...(this.tenantWhere() as FindOptionsWhere<T>),
		};
		return this.repo.findOne({ where });
	}

    createQueryBuilder(alias: string): SelectQueryBuilder<T> {
        return this.repo.createQueryBuilder(alias)
            .andWhere(`${alias}.company_id = :companyId`, { companyId: this.getCompanyId() });
    }

	// updateById(id: string, updateData: QueryDeepPartialEntity<T>): Promise<UpdateResult> {
	// 	const companyId = this.getCompanyId();
	// 	return this.repo.update({ id, companyId }, updateData);
	// }
	
	updateWithTenant(where: Partial<T>, updateData: QueryDeepPartialEntity<T>): Promise<UpdateResult> {
		return this.repo.update(
			{ ...where, companyId: this.getCompanyId() } as FindOptionsWhere<T>,
			updateData,
		);
	}

	async deleteById(id: string): Promise<DeleteResult> {
		const where = { id, companyId: this.getCompanyId() } as unknown as FindOptionsWhere<T>;
		return this.repo.delete(where);
	}
}