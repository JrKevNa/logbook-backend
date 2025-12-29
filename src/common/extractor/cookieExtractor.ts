import { Request } from 'express';

export const cookieExtractor = (req: Request): string | null => {
    return req?.cookies?.accessToken ?? null;
};