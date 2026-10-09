import type { PrismaClient } from '@prisma/client';
import type { Env } from './env.js';

export interface AuthUser {
  id: number;
  role: string;
  email: string;
}

export type AppContext = {
  Bindings: Env;
  Variables: {
    user?: AuthUser;
    prisma: PrismaClient;
  };
};
