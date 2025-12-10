import type { ApiConfig, Method, SearchParams } from '@/services/api/types';
import { iterateSearchPages, throwIfError } from '@/services/api/utils';

export type Accesses = {
  accessId: string;
  action: number;
  description: string;
  object: string;
  overridden: boolean;
  roleAction: number;
};

// TODO: Consider moving typing into nstypes
export type Organization = {
  deleted: boolean;
  domain: string;
  id: string;
  internal: boolean;
  locked: boolean;
  name: string;
  protected: boolean;
  renewedManually: boolean;
  sftpUsername: string;
};

export type OrganizationOptions = { [key: string]: boolean | null | string };

export type User = {
  createdAt: string;
  deleted: boolean;
  email: string;
  globalId: string;
  id: string;
  locked: boolean;
  name: string;
  organizationId: string;
  roleId: string;
  updatedAt: string;
};

export type UserInfo = {
  accesses?: Accesses[];
  accessList?: string[];
  createdAt: string;
  deleted: boolean;
  email: null | string;
  globalId: string;
  id: string;
  locked: boolean;
  mfaStatus: null | string;
  name: string;
  organizationId: string;
  organizationName: string;
  phoneNumber: null | string;
  roleId: string;
  roleName: string;
  updatedAt: string;
};

class UserServiceApiClient {
  baseUrl: null | string | undefined;

  token: null | string | undefined;

  constructor({ baseUrl, token }: ApiConfig) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Get all registered users for an organization
   * @param {string} organizationId
   */
  async getUsers(organizationId: number | string) {
    const users = await iterateSearchPages<User[]>(async (page, pageSize) => {
      const url = new URL(
        `${typeof window === 'undefined' ? '' : window.location.origin}${this.baseUrl}/user/search`,
      );
      const params: SearchParams = { organizationId, page, pageSize };
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      const response = await fetch(url.toString(), this.options('GET'));
      throwIfError(response);
      const json = await response.json();
      return json;
    });

    return {
      results: users,
    };
  }

  // TODO: Complete typing for the functions defined below
  /**
   * Healthcheck
   */
  async healthcheck() {
    const response = await fetch(`${this.baseUrl}/healthcheck`, this.options('GET'));
    throwIfError(response);
    const json = await response.json();

    return json;
  }

  options(method: Method) {
    return {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      method,
    };
  }

  /**
   * Get organization options
   * @param {string} organizationId
   */
  async organizationOptions(
    organizationId: number | string,
  ): Promise<OrganizationOptions> {
    const response = await fetch(
      `${this.baseUrl}/organization/${organizationId}/options/ui`,
      this.options('GET'),
    );
    throwIfError(response, 'organization');
    const json = await response.json();

    return json;
  }

  /**
   * Triggers sending a password reset email for the current user.
   * Only works for username-password users
   */
  async sendPasswordResetEmail() {
    const { id: userId } = await this.userInfo();

    const response = await fetch(
      `${this.baseUrl}/user/${userId}/sendPasswordResetEmail`,
      this.options('GET'),
    );
    throwIfError(response, 'user');
    const json = await response.json();

    return json;
  }

  /**
   * Triggers sending a password verification email for the current user.
   * Only works for username-password users
   */
  async sendVerificationEmail() {
    const { id: userId } = await this.userInfo();

    const response = await fetch(
      `${this.baseUrl}/user/${userId}/sendVerificationEmail`,
      this.options('GET'),
    );
    throwIfError(response, 'user');
    const json = await response.json();

    return json;
  }

  /**
   * Get information for the logged in user
   */
  async userInfo(): Promise<UserInfo> {
    const response = await fetch(`${this.baseUrl}/user/current`, this.options('GET'));
    throwIfError(response, 'user');
    const json = await response.json();

    return json;
  }

  /**
   * Get organization options
   * @param {string} userId
   */
  async userPermissions(userId: number | string) {
    const response = await fetch(
      `${this.baseUrl}/user/${userId}/access`,
      this.options('GET'),
    );
    throwIfError(response, 'user');
    const json = await response.json();

    return json;
  }
}

export default UserServiceApiClient;
