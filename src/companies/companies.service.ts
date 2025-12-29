import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompaniesService {
	constructor(
		@InjectRepository(Company)
		private readonly companyRepo: Repository<Company>,
	) {}

	create(dto: CreateCompanyDto) {
		const company = this.companyRepo.create(dto);
		return this.companyRepo.save(company);
	}

	findAll() {
		return this.companyRepo.find();
	}

	async findOne(id: string) {
		const company = await this.companyRepo.findOne({ where: { id } });
		if (!company) throw new NotFoundException('Company not found');
		return company;
	}

	async update(id: string, dto: UpdateCompanyDto) {
		const company = await this.findOne(id);
		Object.assign(company, dto);
		return this.companyRepo.save(company);
	}

	async remove(id: string) {
		const company = await this.findOne(id);
		return this.companyRepo.remove(company);
	}
}
