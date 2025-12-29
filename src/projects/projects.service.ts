import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { CreateLogbookDto } from 'src/logbook/dto/create-logbook.dto';
import { LogbookService } from 'src/logbook/logbook.service';
import { User } from 'src/users/entities/user.entity';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { ProjectRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
	constructor(
		// @InjectRepository(Project)
		// private readonly projectRepo: Repository<Project>,
		private readonly projectRepo: ProjectRepository,

		private readonly caslAbilityFactory: CaslAbilityFactory, 
	) {}

	async create(companyId: string, userId: string, createDto: CreateProjectDto) {
		const project = this.projectRepo.create({
			name: createDto.name,
			startDate: createDto.startDate,
			endDate: createDto.endDate,
			workedById: createDto.workedById,
			requestedBy: createDto.requestedBy,
			createdById: userId,
		});

		return await this.projectRepo.save(project);
	}

	async paginate(
		companyId: string,
		userId: string,
		page: number,
		limit: number,
		search?: string
	) {
		const query = this.projectRepo
			.createQueryBuilder('project')
			.where('project.company_id = :companyId', { companyId })
			// .andWhere('toDo.created_by = :userId', { userId })
			.leftJoin('project.workedBy', 'user')
			.addSelect(['user.id', 'user.username']);

		if (search) {
			query.andWhere(
				`(LOWER(project.name) LIKE LOWER(:search))`,
				{ search: `%${search}%` }
			);
		}

		const total = await query.getCount();

		const projects = await query
			.orderBy('project.isDone', 'ASC')       // false first, true last
			.addOrderBy('project.endDate', 'ASC')   // earliest deadline first
			.skip((page - 1) * limit)
			.take(limit)
			.getMany();

		return {
			projects,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		};
	}

	findAll() {
		return `This action returns all projects`;
	}

	async findOne(id: string, companyId: string) {
		// fetch the project where id matches and the user belongs to the same company
		const project = await this.projectRepo.findOneById(id);

		if (!project) {
			throw new Error('Project not found or access denied');
		}

		return project;
	}

	// update(id: number, updateProjectDto: UpdateProjectDto) {
	// 	return `This action updates a #${id} project`;
	// }
	async finish(id: string, user: User, updateDto: UpdateProjectDto) {
		const project = await this.projectRepo.findOneById(id);
		if (!project) throw new NotFoundException();

		const ability = this.caslAbilityFactory.createForUser(user);
		ForbiddenError.from(await ability).throwUnlessCan('update', project);

		Object.assign(project, { isDone: true, updatedById: user.id });

		return this.projectRepo.save(project);
	}

	async update(id: string, user: User, updateDto: UpdateProjectDto) {
		// Check if project exists and belongs to company
		const project = await this.projectRepo.findOneById(id);
		if (!project) throw new NotFoundException();

		const ability = this.caslAbilityFactory.createForUser(user);
		ForbiddenError.from(await ability).throwUnlessCan('update', project);

		Object.assign(project, updateDto, { updatedById: user.id });

		return this.projectRepo.save(project);
	}

	async remove(id: string, user: User) {
		const project = await this.projectRepo.findOneById(id);
		if (!project) throw new NotFoundException();

		const ability = this.caslAbilityFactory.createForUser(user);
		ForbiddenError.from(await ability).throwUnlessCan('delete', project);

		const result = await this.projectRepo.deleteById( id );

		if (result.affected === 0) {
			throw new NotFoundException('Logbook not found');
		}

		return { success: true };
	}
}
