import { Test, TestingModule } from '@nestjs/testing';
import { DetailProjectsService } from './detail-projects.service';

describe('DetailProjectsService', () => {
  let service: DetailProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetailProjectsService],
    }).compile();

    service = module.get<DetailProjectsService>(DetailProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
