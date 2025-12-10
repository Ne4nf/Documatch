import { getSession } from '@auth0/nextjs-auth0';

import TemplatelessApiV2Client from './TemplatelessApiV2/TemplatelessApiV2Client';
import UserServiceApiClient from './UserServiceApi/UserServiceApiClient';

function getApiClient() {
  const isClient = typeof window !== 'undefined';

  if (!isClient) {
    throw new Error(
      'getApiClient can only be used from the client. Use getServerApiClient instead',
    );
  }

  return new TemplatelessApiV2Client({ baseUrl: '/api/tless' });
}

async function getServerApiClient() {
  const isServer = typeof window === 'undefined';

  if (!isServer) {
    throw new Error(
      'getServerApiClient can only be used from the server. Use getApiClient instead',
    );
  }

  const { TEMPLATELESS_API_V2_URL: baseUrl } = process.env;
  const session = await getSession();

  const { idToken: token } = session || {};

  return new TemplatelessApiV2Client({ baseUrl, token });
}

async function getServerUserServiceApiClient() {
  const isServer = typeof window === 'undefined';

  if (!isServer) {
    throw new Error(
      'getServerUserServiceApiClient can only be used from the server. Use getUserServiceApiClient instead',
    );
  }

  const { USER_SERVICE_API_URL: baseUrl } = process.env;
  const session = await getSession();

  const { idToken: token } = session || {};

  return new UserServiceApiClient({ baseUrl, token });
}

function getUserServiceApiClient() {
  const isClient = typeof window !== 'undefined';

  if (!isClient) {
    throw new Error(
      'getUserServiceApiClient can only be used from the client. Use getServerUserServiceApiClient instead',
    );
  }

  return new UserServiceApiClient({ baseUrl: '/api/user' });
}

export {
  getApiClient,
  getServerApiClient,
  getServerUserServiceApiClient,
  getUserServiceApiClient,
};
