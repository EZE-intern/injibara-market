import { WorkOS } from '@workos-inc/node';
import type { Env } from '../types/env.js';

export function getWorkOS(env?: Env) {
  const apiKey = env?.WORKOS_API_KEY || process.env.WORKOS_API_KEY || '';
  const workosClientId = env?.WORKOS_CLIENT_ID || process.env.WORKOS_CLIENT_ID || '';
  const defaultRedirectUri =
    env?.WORKOS_REDIRECT_URI ||
    process.env.WORKOS_REDIRECT_URI ||
    'https://injibara-market.vercel.app/auth/callback';

  const workos = new WorkOS(apiKey, {
    clientId: workosClientId,
  });

  const isWorkOSConfigured = (): boolean => {
    return Boolean(apiKey && workosClientId);
  };

  return {
    workos,
    workosClientId,
    defaultRedirectUri,
    isWorkOSConfigured,
  };
}
