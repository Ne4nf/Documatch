import type { Prompt } from '@nstypes/templateless';
import { PromisePool } from '@supercharge/promise-pool';

import { getApiClient } from '@/services/api';
import type { DocumentGroupItem } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';

import type { Group } from './DocumentCustomGrouping';

// TODO change the data type to Raw Document once the API has been changed
export async function customDocumentGrouping(
  data: any,
  customGroups: Group[],
  prompts: Prompt[],
) {
  const apiClient = getApiClient();
  const groups: DocumentGroupItem[] = [];
  const groupsWithOcr: { promptId: number; useOcr: boolean }[] = [];

  for (const group of customGroups) {
    const startPage = data.pages.find(
      (page: { pageNumber: number }) => page.pageNumber === Number(group.pageRange.from),
    );
    const rangeArray = Array.from(
      { length: Number(group.pageRange.to) - Number(group.pageRange.from) + 1 },
      (_, i) => i + Number(startPage.id),
    );
    const promptId = mapPromptNameToId(group.documentType, prompts);
    groups.push({
      pages: rangeArray,
      promptId: promptId || 1,
    });

    groupsWithOcr.push({
      promptId: promptId || 1,
      useOcr: group.useOcr,
    });
  }

  try {
    await apiClient.groupDocument(data.id, groups);
    // TODO change the data type to Raw Document once the API has been changed
    const groupRes: any = await apiClient.getDocument(data.id);

    await PromisePool.for(groupsWithOcr)
      .withConcurrency(5)
      .process(async (groupWithOcr, index) => {
        const curGroupId = groupRes.pageGroups[index].id;
        await apiClient.rescanDocumentPageGroup(
          data.id,
          curGroupId,
          groupWithOcr.promptId,
          groupWithOcr.useOcr,
        );
      });
  } catch (e) {
    console.log(e);
  }
}

// TODO change the data type to Raw Document once the API has been changed
export async function treatEachPageAsOneGroup(
  data: any,
  promptName: string,
  prompts: Prompt[],
  useOcr: boolean,
) {
  const apiClient = getApiClient();
  const promptId = mapPromptNameToId(promptName, prompts);
  const groups: DocumentGroupItem[] = [];
  data.pages.forEach((page: { id: string }) => {
    if (promptId !== undefined) {
      groups.push({ pages: [Number(page.id)], promptId });
    } else {
      groups.push({ pages: [Number(page.id)], promptId: 1 });
    }
  });

  try {
    await apiClient.groupDocument(data.id, groups);
    await apiClient.rescanDocument(data.id, useOcr);
  } catch (e) {
    console.log(e);
  }
}

// TODO change the data type to Raw Document once the API has been changed
export async function treatWholePdfAsOneGroup(
  data: any,
  promptName: string,
  prompts: Prompt[],
  useOcr: boolean,
) {
  const apiClient = getApiClient();
  const promptId = mapPromptNameToId(promptName, prompts);
  const group: DocumentGroupItem = {
    pages: data.pages.map((page: { id: string }) => Number(page.id)),
    promptId: promptId || 1,
  };
  const groups = [group];

  try {
    await apiClient.groupDocument(data.id, groups);
    await apiClient.rescanDocument(data.id, useOcr);
  } catch (e) {
    console.log(e);
  }
}

function mapPromptNameToId(promptName: string, prompts: Prompt[]) {
  return prompts?.find(prompt => prompt.name === promptName)?.id;
}
