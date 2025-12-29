import { Injectable } from "@nestjs/common";
import { TenantRepository } from "src/common/tenant/tenant.repository";
import { DetailProject } from "./entities/detail-project.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class DetailProjectRepository extends TenantRepository<DetailProject> {
    constructor(
        @InjectRepository(DetailProject)
        private readonly detailProjectRepo: Repository<DetailProject>,
    ) {
        super(detailProjectRepo); // pass to base class
    }

    // Add model-specific methods here if needed
}