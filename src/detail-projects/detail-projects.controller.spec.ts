import { Test, TestingModule } from '@nestjs/testing';
import { DetailProjectsController } from './detail-projects.controller';
import { DetailProjectsService } from './detail-projects.service';

describe('DetailProjectsController', () => {
  let controller: DetailProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetailProjectsController],
      providers: [DetailProjectsService],
    }).compile();

    controller = module.get<DetailProjectsController>(DetailProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
