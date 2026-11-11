import type { PrismaClient } from '../generated/prisma/client.js';
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
