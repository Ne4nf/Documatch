import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTranslations } from 'next-intl';
import React from 'react';

import { CompactButton } from '@/components/Buttons';

interface UploadButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function UploadButton(props: UploadButtonProps) {
  const t = useTranslations('DocumentList');

  return (
    <CompactButton
      onClick={props.onClick}
      startIcon={<AddCircleOutlineIcon />}
      variant="contained"
    >
      {t('upload')}
    </CompactButton>
  );
}

export default UploadButton;
export { UploadButton };
