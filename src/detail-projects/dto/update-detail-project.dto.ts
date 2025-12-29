import { PartialType } from '@nestjs/mapped-types';
import { CreateDetailProjectDto } from './create-detail-project.dto';

export class UpdateDetailProjectDto extends PartialType(CreateDetailProjectDto) {
    projectId: string;
    activity?: string;
    requestDate?: Date;
    workedById?: string;
    requestedBy?: string;
    note?: string;
}
