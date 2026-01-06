import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    username?: string;
    nik?: string;
    email?: string;
    // password?: string;
    companyId?: string;
    roleId?: string
}
