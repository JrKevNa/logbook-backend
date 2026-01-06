import { Injectable } from "@nestjs/common";
import { TenantRepository } from "src/common/tenant/tenant.repository";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";

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

    createUserFromRegister(data: CreateUserDto) {
        return this.userRepo.create(data);
    }

    saveUserFromRegister(user: User): Promise<User> {
        return this.userRepo.save(user);
    }
}
