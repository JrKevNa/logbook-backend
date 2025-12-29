import { Injectable } from "@nestjs/common";
import { TenantRepository } from "src/common/tenant/tenant.repository";
import { Project } from "./entities/project.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ProjectRepository extends TenantRepository<Project> {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepo: Repository<Project>,
    ) {
        super(projectRepo); // pass to base class
    }

    // Add model-specific methods here if needed
}
