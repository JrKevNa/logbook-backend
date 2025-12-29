// cookies.config.ts
import { CookieOptions } from 'express';

const ACCESS_TTL = Number(process.env.ACCESS_TOKEN_TTL_MS);
const REFRESH_TTL = Number(process.env.REFRESH_TOKEN_TTL_MS);
const CSRF_TTL = Number(process.env.CSRF_TOKEN_TTL_MS);

export const REFRESH_TOKEN_COOKIE: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    path: '/',
};

export const ACCESS_TOKEN_COOKIE: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // maxAge: 1000 * 60 * 0.1, // 6 second
    maxAge: 1000 * 60 * 1, // 60 second
    path: '/',
};

export const CSRF_COOKIE: CookieOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // maxAge: 1000 * 60 * 0.1, // 6 second
    maxAge: 1000 * 60 * 1, // 60 second
    path: '/',
};

export const TOKEN_EXPIRY = {
    // access: '6s',
    access: '60s',
    refresh: '30d',
} as const;