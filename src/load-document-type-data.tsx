import { ErrorPage } from '@/components/ErrorPage';
import type TemplatelessApiV2Client from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';

async function loadPresetPrompts(apiClient: TemplatelessApiV2Client) {
  if (!apiClient.token) {
    return {
      errorComponent: undefined,
      presetPrompts: [],
    };
  }
  try {
    const data = await apiClient.getAllPresetPrompts();
    return {
      errorComponent: undefined,
      presetPrompts: data.results,
    };
  } catch (e) {
    return {
      errorComponent: <ErrorPage error={e as Error} />,
      presetPrompts: undefined,
    };
  }
}
async function preloadFirstDocumentTypePage(apiClient: TemplatelessApiV2Client) {
  if (!apiClient.token) {
    return {
      errorComponent: undefined,
      firstDocumentTypePage: undefined,
    };
  }
  try {
    const data = await apiClient.searchPrompts();
    return {
      errorComponent: undefined,
      firstDocumentTypePage: data,
    };
  } catch (e) {
    return {
      errorComponent: <ErrorPage error={e as Error} />,
      firstDocumentTypePage: undefined,
    };
  }
}
export { loadPresetPrompts, preloadFirstDocumentTypePage };
