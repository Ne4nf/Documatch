import type { CorrectedItem } from '@nstypes/templateless';

export type CheckedIds = {
  pageGroupId: string;
  rowIds: (number | string)[];
};

export type CorrectedItemWithId = CorrectedItem & {
  id: string;
};
