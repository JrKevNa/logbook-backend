import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateToDoListDto } from './dto/create-to-do-list.dto';
import { UpdateToDoListDto } from './dto/update-to-do-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ToDoList } from './entities/to-do-list.entity';
import { Repository } from 'typeorm';
import { Logbook } from 'src/logbook/entities/logbook.entity';
import { LogbookService } from 'src/logbook/logbook.service';
import { CreateLogbookDto } from 'src/logbook/dto/create-logbook.dto';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { User } from 'src/users/entities/user.entity';
import { ForbiddenError } from '@casl/ability';
import { ToDoListRepository } from './to-do-list.repository';

@Injectable()
export class ToDoListService {
	constructor(
		// @InjectRepository(ToDoList)
		private readonly toDoListRepo: ToDoListRepository,
		// private readonly toDoListRepo: Repository<ToDoList>,

		private readonly caslAbilityFactory: CaslAbilityFactory, 
	) {}

	create(
		companyId: string,
		userId: string,
		createDto: CreateToDoListDto
	) {
		const toDo = this.toDoListRepo.create({
			...createDto,
			// companyId, // 👈 set it here, not in DTO
			createdById: userId,
		});

		return this.toDoListRepo.save(toDo); 
	}

	async paginate(
		companyId: string,
		userId: string,
		page: number,
		limit: number,
		search?: string
	) {
		const query = this.toDoListRepo
			.createQueryBuilder('toDo')
			.where('toDo.company_id = :companyId', { companyId })
			.andWhere('toDo.created_by = :userId', { userId })
			.leftJoin('toDo.createdBy', 'user')
			.addSelect(['user.id', 'user.username']);

		if (search) {
			query.andWhere(
				`(LOWER(toDo.activity) LIKE LOWER(:search))`,
				{ search: `%${search}%` }
			);
		}

		const total = await query.getCount();

		const toDoList = await query
			.orderBy('toDo.isDone', 'ASC')  
			.addOrderBy('toDo.createDate', 'DESC')
			.skip((page - 1) * limit)
			.take(limit)
			.getMany();

		return {
			toDoList,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		};
	}

	async finish(id: string, user: User, updateDto: UpdateToDoListDto) {
		const toDo = await this.toDoListRepo.findOneById( id );
		if (!toDo) throw new NotFoundException();

		const ability = this.caslAbilityFactory.createForUser(user);
		ForbiddenError.from(await ability).throwUnlessCan('update', toDo);

		Object.assign(toDo, { isDone: true, updatedById: user.id });

		return this.toDoListRepo.save(toDo);
	}


	async update(id: string, user: User, updateDto: UpdateToDoListDto) {
		const toDo = await this.toDoListRepo.findOneById( id );
		if (!toDo) throw new NotFoundException();

		const ability = this.caslAbilityFactory.createForUser(user);
		ForbiddenError.from(await ability).throwUnlessCan('update', toDo);

		Object.assign(toDo, updateDto, { updatedById: user.id });

		return this.toDoListRepo.save(toDo);
	}

	async remove(id: string, user: User) {
		const toDo = await this.toDoListRepo.findOneById( id );
		if (!toDo) throw new NotFoundException();

		const ability = this.caslAbilityFactory.createForUser(user);
		ForbiddenError.from(await ability).throwUnlessCan('delete', toDo);

		const result = await this.toDoListRepo.deleteById( id );

		if (result.affected === 0) {
			throw new NotFoundException('Logbook not found');
		}

		return { success: true };
	}
}
