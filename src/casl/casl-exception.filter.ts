import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';

@Catch(ForbiddenError)
export class CaslExceptionFilter implements ExceptionFilter {
    catch(exception: ForbiddenError<any>, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        response.status(403).json({
            statusCode: 403,
            error: 'Forbidden',
            message: exception.message,
        });
    }
}