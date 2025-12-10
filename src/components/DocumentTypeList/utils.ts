import type { FormError, PayloadDocumentTypeForm } from '@/components/DocumentTypeForm';
import { removeEmptyItems } from '@/utils';

export const validatePayloadValues = (values: PayloadDocumentTypeForm, t: any) => {
  const errors: FormError = {};
  if (!values?.name) {
    errors.name = { error: true, helperText: t('required') };
  }
  if (!values?.documentType) {
    errors.documentType = { error: true, helperText: t('required') };
  }
  if (values?.fieldsPrompt?.some(field => !field.item)) {
    errors.fieldsPrompt = {
      error: true,
      helperText: `${t('fieldName')} (${t('required')})`,
    };
  }
  if (values?.tablePrompt?.some(field => !field.item)) {
    errors.tablePrompt = {
      error: true,
      helperText: `${t('fieldName')} (${t('required')})`,
    };
  }
  if (Object.keys(errors).length > 0) {
    return { error: true, errors };
  }
  return { error: false, errors: {} };
};

export const cleanData = (data: any[]) => {
  return data
    .filter(field => field.instruction !== '')
    .map(({ id: _id, ...rest }) => rest);
};

export const preparePayload = (formValue: any, isEdit = false) => {
  const clonePayload: any = removeEmptyItems(structuredClone(formValue));

  if (clonePayload.fieldsPrompt?.length) {
    clonePayload.fieldsPrompt = cleanData(clonePayload.fieldsPrompt);
  }

  if (clonePayload.tablePrompt?.length) {
    clonePayload.tablePrompt = cleanData(clonePayload.tablePrompt);
    if (isEdit) {
      clonePayload.textualTablePrompt = null;
    } else {
      delete clonePayload.textualTablePrompt;
    }
  }

  if (clonePayload.textualTablePrompt) {
    if (isEdit) {
      clonePayload.tablePrompt = null;
    } else {
      delete clonePayload.tablePrompt;
    }
  }

  if (!clonePayload.extractTable) {
    if (isEdit) {
      clonePayload.tablePrompt = null;
      clonePayload.textualTablePrompt = null;
    } else {
      delete clonePayload.tablePrompt;
      delete clonePayload.textualTablePrompt;
    }
  }

  clonePayload.extractTable = !!(
    clonePayload.tablePrompt?.length || clonePayload.textualTablePrompt
  );

  return clonePayload;
};
