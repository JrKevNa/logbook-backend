export class CreateUserDto {
    username: string;
    nik: string;
    email: string;
    password: string;
    companyId: string;
    roleId?: string
}
