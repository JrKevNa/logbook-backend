import { Injectable } from "@nestjs/common";
import { TenantRepository } from "src/common/tenant/tenant.repository";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class UsersRepository extends TenantRepository<User> {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {
        super(userRepo); // pass to base class
    }

    // Add model-specific methods here if needed
    get manager(): EntityManager {
        return this.repo.manager;
    }
}
