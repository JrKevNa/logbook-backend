import { PartialType } from '@nestjs/mapped-types';
import { CreateLogbookDto } from './create-logbook.dto';

export class UpdateLogbookDto extends PartialType(CreateLogbookDto) {
    activity?: string;
    logDate?: Date;
    durationNumber?: number;
    durationUnit?: string;
}
