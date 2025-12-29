import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { Logbook } from './entities/logbook.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenError } from '@casl/ability';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LogbookRepository } from './logbook.repository';

@Injectable()
export class LogbookService {
	constructor(
		// @InjectRepository(Logbook)
		// private readonly logbookRepo: Repository<Logbook>,

		private readonly logbookRepo: LogbookRepository,

		private readonly caslAbilityFactory: CaslAbilityFactory, 
	) {}

	create(user: User, dto: CreateLogbookDto) {
		const logbook = this.logbookRepo.create({
			...dto,
			createdById: user.id
		});
		return this.logbookRepo.save(logbook);
	}

	// async findAll(companyId: string) {
	// 	const items = await this.logbookRepo.find({
	// 		where: { companyId },
	// 	});
	// }

	async paginate(
		companyId: string,
		userId: string,
		page: number,
		limit: number,
		search?: string
	) {
		const query = this.logbookRepo
			.createQueryBuilder('log')
			// .where('log.company_id = :companyId', { companyId })
			.andWhere('log.created_by = :userId', { userId })
			.leftJoin('log.createdBy', 'user')
			.addSelect(['user.id', 'user.username']);

		if (search) {
			query.andWhere(
				`(LOWER(log.activity) LIKE LOWER(:search) 
					OR CAST(log.durationNumber AS TEXT) LIKE :search
					OR CAST(log.logDate AS TEXT) LIKE :search)`,
				{ search: `%${search}%` }
			);
		}

		const total = await query.getCount();

		const logbooks = await query
			.orderBy('log.logDate', 'DESC')
			.skip((page - 1) * limit)
			.take(limit)
			.getMany();

		return {
			logbooks,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		};
	}

	// logbook.service.ts
	async getLogsGroupedByDay(user: User, startDate: string, endDate: string, userId?: string,) {
		// Determine if the current user is an admin
		const isAdmin = user.roles?.includes('admin') ?? false;

		let effectiveUserId: string | undefined;

		if (!userId) {
			// If no user selected, default to current user if not admin
			effectiveUserId = isAdmin ? undefined : user.id;
		} else {
			// If a user is selected in picklist
			effectiveUserId = isAdmin ? userId : user.id; // non-admins can only see their own
		}
		
		const where: any = {
			companyId: user.companyId,
			logDate: Between(new Date(startDate), new Date(endDate)),
		};

		if (effectiveUserId) {
			where.createdById = effectiveUserId;
		}

		const logs = await this.logbookRepo.find({
			where,
			order: { logDate: 'DESC' },
			relations: ['createdBy'],   // <-- Add this
		});

		const grouped = logs.reduce((acc, log) => {
			const date = new Date(log.logDate);
			const key = date.toISOString().slice(0, 10);
			if (!acc[key]) acc[key] = [];
			acc[key].push(log);
			return acc;
		}, {} as Record<string, any[]>);

		return Object.entries(grouped).map(([date, entries]) => ({ date, entries }));
	}
	
	async getLogsGroupedByUser(user: User, startDate: string, endDate: string, userId?: string) {
		// Determine if the current user is an admin
		const isAdmin = user.roles?.includes('admin') ?? false;

		let effectiveUserId: string | undefined;

		if (!userId) {
			// If no user selected, default to current user if not admin
			effectiveUserId = isAdmin ? undefined : user.id;
		} else {
			// If a user is selected in picklist
			effectiveUserId = isAdmin ? userId : user.id; // non-admins can only see their own
		}
		
		const where: any = {
			companyId: user.companyId,
			logDate: Between(new Date(startDate), new Date(endDate)),
		};

		if (effectiveUserId) {
			where.createdById = effectiveUserId;
		}

		const logs = await this.logbookRepo.find({
			where,
			relations: ['createdBy'], // include user info
			order: { logDate: 'DESC' },
		});

		// Group logs by user
		const grouped = logs.reduce((acc, log) => {
			const key = log.createdBy?.id || 'unknown';
			if (!acc[key]) {
				acc[key] = {
					user: log.createdBy || { id: 'unknown', username: 'Unknown' },
					entries: [],
				};
			}
			acc[key].entries.push(log);
			return acc;
		}, {} as Record<string, { user: any; entries: any[] }>);

		// Convert to array for easier use in frontend
		return Object.values(grouped);
	}

	async update(id: string, user: User, updateDto: UpdateLogbookDto) {
		const logbook = await this.logbookRepo.findOneById( id );
		if (!logbook) throw new NotFoundException();

		const ability = this.caslAbilityFactory.createForUser(user);

		// 👇 THIS is CASL doing the job
		ForbiddenError.from(await ability).throwUnlessCan('update', logbook);

		Object.assign(logbook, updateDto, { updatedById: user.id });

		return this.logbookRepo.save(logbook);
	}

	// async update(id: string, companyId: string, userId: string, updateDto: UpdateLogbookDto) {
	// 	const result = await this.logbookRepo.update(
	// 		{ id, companyId }, // 👈 filter by both id and companyId
	// 		{
	// 			...updateDto,
	// 			updatedById: userId,
	// 		}
	// 	);

	// 	if (result.affected === 0) {
	// 		throw new NotFoundException(`Logbook not found or not owned by this company`);
	// 	}

	// 	return this.findOne(id);
	// }

	async remove(id: string, user: User) {
		// 1. Load the logbook
		const logbook = await this.logbookRepo.findOneById( id );
		if (!logbook) throw new NotFoundException();

		// 2. Build ability for this user
		const ability = await this.caslAbilityFactory.createForUser(user);

		// 3. CASL enforces authorization
		ForbiddenError.from(ability).throwUnlessCan('delete', logbook);

		// 4. Delete using tenant-safe repository
		const result = await this.logbookRepo.deleteById(id);

		if (result.affected === 0) {
			throw new NotFoundException('Logbook not found');
		}

		return { success: true };
	}
}
