import { WorkOS } from '@workos-inc/node';

const apiKey = process.env.WORKOS_API_KEY || '';
export const workosClientId = process.env.WORKOS_CLIENT_ID || '';
export const defaultRedirectUri =
  process.env.WORKOS_REDIRECT_URI || 'https://injibara-market.vercel.app/auth/callback';

export const workos = new WorkOS(apiKey, {
  clientId: workosClientId,
});

export const isWorkOSConfigured = (): boolean => {
  return Boolean(apiKey && workosClientId);
};
