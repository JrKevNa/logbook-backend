import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
    name?: string;
    workedById?: string;
    requestedBy?: string;
    startDate?: Date;
    endDate?: Date;
    durationNumber?: number;
    durationUnit?: string;
}
