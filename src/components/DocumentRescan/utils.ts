import { getApiClient } from '@/services/api';

export async function handleCloseModal(
  closeModal: () => void,
  isScanScreen: boolean,
  documentId: string,
) {
  const deleteNewCreatedDocument = async () => {
    try {
      const apiClient = getApiClient();
      await apiClient.deleteDocument(documentId);
    } catch (e) {
      console.error('Error deleting newly created doccument', e);
    }
  };
  if (isScanScreen) {
    await deleteNewCreatedDocument();
  }
  closeModal();
}
