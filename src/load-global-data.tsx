import { ErrorPage } from '@/components/ErrorPage';
import type TemplatelessApiV2Client from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import type UserServiceApiClient from '@/services/api/UserServiceApi/UserServiceApiClient';
import type {
  OrganizationOptions,
  UserInfo,
} from '@/services/api/UserServiceApi/UserServiceApiClient';

// Only accesses that are listed here will be put in state.
// Add any access you need to check in the UI here.
const AccessesForUI = new Set([
  'asr-alpha-ui',
  'block-ui-access',
  'definition-file-create',
  'definition-file-delete',
  'definition-file-edit',
  'definition-file-read',
  'documatch-api',
  'documatch-ui',
  'features/debug-info',
]);

// Only organization options that are listed here will be put in state.
// Add any option you need to check in the UI here.
const OrganizationOptionsForUI = new Set([
  'allowEnhancedPDFConversionMethod',
  'allowPdfExtraction',
  'defaultDefinitionId',
  'hideASRAlphaUploadUI',
  'hideContractInformation',
  'maxTags',
  'preselectTagStrategy',
  'singleTag',
  'useDefinitionDetection',
  'useTags',
]);

async function loadDefinitions(apiClient: TemplatelessApiV2Client) {
  if (!apiClient.token) {
    return {
      definitions: [],
      errorComponent: undefined,
    };
  }

  try {
    const data = await apiClient.getAllDefinitions();

    return {
      definitions: data.results,
      errorComponent: undefined,
    };
  } catch (e) {
    return {
      definitions: undefined,
      errorComponent: <ErrorPage error={e as Error} />,
    };
  }
}

async function loadPermissionsAndOptions(apiClient: UserServiceApiClient) {
  if (!apiClient.token) {
    return {
      errorComponent: undefined,
      organizationOptions: {} as OrganizationOptions,
      userInfo: {} as UserInfo,
    };
  }

  try {
    const userInfo = await apiClient.userInfo();
    const { accesses, organizationId, ...baseUserInfo } = userInfo;
    const organizationOptions = await apiClient.organizationOptions(organizationId);

    const processedAccesses =
      accesses
        ?.filter(access => AccessesForUI.has(access.object) && access.action === 1)
        .map(access => access.object) ?? [];

    const processedOrganizationOptions: OrganizationOptions = {};

    Object.entries(organizationOptions).forEach(([key, value]) => {
      if (OrganizationOptionsForUI.has(key)) {
        processedOrganizationOptions[key] = value;
      }
    });

    return {
      errorComponent: undefined,
      organizationOptions: processedOrganizationOptions,
      userInfo: {
        ...baseUserInfo,
        accessList: processedAccesses,
        organizationId,
      } as UserInfo,
    };
  } catch (e) {
    if (e instanceof Error && e.toString().includes('403')) {
      return {
        errorComponent: <ErrorPage error={e} />,
        organizationOptions: {} as OrganizationOptions,
        userInfo: {} as UserInfo,
      };
    }

    return {
      errorComponent: <ErrorPage error={e as Error} />,
      organizationOptions: {} as OrganizationOptions,
      userInfo: {} as UserInfo,
    };
  }
}

async function loadPrompts(apiClient: TemplatelessApiV2Client) {
  if (!apiClient.token) {
    return {
      errorComponent: undefined,
      prompts: [],
    };
  }

  try {
    const data = await apiClient.getAllPrompts();

    return {
      errorComponent: undefined,
      prompts: data.results,
    };
  } catch (e) {
    return {
      errorComponent: <ErrorPage error={e as Error} />,
      prompts: undefined,
    };
  }
}

async function loadUsers(
  apiClient: UserServiceApiClient,
  organizationId: number | string,
) {
  if (!apiClient.token) {
    return {
      errorComponent: undefined,
      users: [],
    };
  }

  try {
    const users = await apiClient.getUsers(organizationId);

    return {
      errorComponent: undefined,
      users: users.results,
    };
  } catch (e) {
    return {
      errorComponent: <ErrorPage error={e as Error} />,
      users: [],
    };
  }
}

async function preloadFirstDocumentSearchPage(apiClient: TemplatelessApiV2Client) {
  if (!apiClient.token) {
    return {
      errorComponent: undefined,
      firstSearchPage: undefined,
    };
  }

  try {
    const data = await apiClient.searchDocuments({ scanMode: 'llm' });

    return {
      errorComponent: undefined,
      firstSearchPage: data,
    };
  } catch (e) {
    return {
      errorComponent: <ErrorPage error={e as Error} />,
      firstSearchPage: undefined,
    };
  }
}

export {
  loadDefinitions,
  loadPermissionsAndOptions,
  loadPrompts,
  loadUsers,
  preloadFirstDocumentSearchPage,
};
