import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetailProjectDto } from './dto/create-detail-project.dto';
import { UpdateDetailProjectDto } from './dto/update-detail-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetailProject } from './entities/detail-project.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { DetailProjectRepository } from './detail-projects.repository';

@Injectable()
export class DetailProjectsService {
	constructor(
		// @InjectRepository(DetailProject)
		// private readonly detailProjectRepo: Repository<DetailProject>,
		private readonly detailProjectRepo: DetailProjectRepository,

		private readonly usersService: UsersService,

		// private readonly caslAbilityFactory: CaslAbilityFactory, 
	) {}
	
	async create(companyId: string, userId: string, createDto: CreateDetailProjectDto) {
		const workedByUser = await this.usersService.findOne(createDto.workedById, companyId);

		if (!workedByUser) {
			throw new ForbiddenException('WorkedBy user is invalid or not in your company');
		}

		const project = this.detailProjectRepo.create({
			projectId: createDto.projectId,
			activity: createDto.activity,
			requestDate: createDto.requestDate,
			workedById: createDto.workedById,
			requestedBy: createDto.requestedBy,
			createdById: userId,
			note: createDto.note,
		});

		return await this.detailProjectRepo.save(project);
	}

	async paginate(
		id: string,
		companyId: string,
		userId: string,
		page: number,
		limit: number,
		search?: string
	) {
		const query = this.detailProjectRepo
			.createQueryBuilder('detailProject')
			.where('detailProject.company_id = :companyId', { companyId })
			.andWhere('detailProject.project_id = :id', { id })
			.leftJoin('detailProject.workedBy', 'user')
			.addSelect(['user.id', 'user.username']);

		if (search) {
			query.andWhere(
				`(LOWER(detailProject.activity) LIKE LOWER(:search))`,
				{ search: `%${search}%` }
			);
		}

		const total = await query.getCount();

		const detailProjects = await query
			.orderBy('detailProject.isDone', 'ASC')       // false first, true last
			.addOrderBy('detailProject.requestDate', 'ASC')   // earliest deadline first
			.skip((page - 1) * limit)
			.take(limit)
			.getMany();

		return {
			detailProjects,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		};
	}


	async finish(id: string, user: User, updateDto: UpdateDetailProjectDto) {
		const detailProject = await this.detailProjectRepo.findOneById(id);
		if (!detailProject) throw new NotFoundException();

		// const ability = this.caslAbilityFactory.createForUser(user);
		// ForbiddenError.from(await ability).throwUnlessCan('update', detailProject);

		Object.assign(detailProject, { isDone: true, updatedById: user.id });

		return this.detailProjectRepo.save(detailProject);
	}

	async update(id: string, user: User, updateDto: UpdateDetailProjectDto) {
		const detailProject = await this.detailProjectRepo.findOneById(id);
		if (!detailProject) throw new NotFoundException();

		// const ability = this.caslAbilityFactory.createForUser(user);
		// ForbiddenError.from(await ability).throwUnlessCan('update', detailProject);

		Object.assign(detailProject, updateDto, { updatedById: user.id });

		return this.detailProjectRepo.save(detailProject);
	}

	async remove(id: string, user: User) {
		const detailProject = await this.detailProjectRepo.findOneById(id);
		if (!detailProject) throw new NotFoundException();

		// const ability = this.caslAbilityFactory.createForUser(user);
		// ForbiddenError.from(await ability).throwUnlessCan('delete', detailProject);

		const result = await this.detailProjectRepo.deleteById( id );

		if (result.affected === 0) {
			throw new NotFoundException('Logbook not found');
		}

		return { success: true };
	}
}
