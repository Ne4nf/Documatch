import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { blue, green, orange, red } from '@mui/material/colors';
import Tooltip from '@mui/material/Tooltip';
import { useTranslations } from 'next-intl';

import { DOCUMENT_STATUS } from '@/constants';
import type { DocumentStatus } from '@/types';

type ScanStatusIconProps = {
  status?: DocumentStatus;
};

export function ScanStatusIcon({ status = 'scanned' }: ScanStatusIconProps) {
  const t = useTranslations('DocumentStatus');
  const tooltipTitle = t(status);
  const margins = { marginRight: '10px' };
  const size = { fontSize: '32px' };

  let icon;

  switch (status) {
    case DOCUMENT_STATUS.PROCESSED:
      icon = <VisibilityIcon sx={{ ...margins, ...size, color: orange[500] }} />;
      break;
    case DOCUMENT_STATUS.PROCESSING_ERROR:
      icon = <ErrorIcon sx={{ ...margins, ...size, color: red[500] }} />;
      break;
    case DOCUMENT_STATUS.PROCESSING_PENDING:
      icon = <EditIcon sx={{ ...size, color: blue[500] }} />;
      break;
    case DOCUMENT_STATUS.SCAN_ERROR:
      icon = <ErrorIcon sx={{ ...margins, ...size, color: red[500] }} />;
      break;
    case DOCUMENT_STATUS.SCAN_PENDING:
      icon = <VisibilityIcon sx={{ ...margins, ...size, color: orange[500] }} />;
      break;
    case DOCUMENT_STATUS.SCANNED:
      icon = <DescriptionIcon sx={{ ...margins, ...size, color: green[500] }} />;
      break;
    case DOCUMENT_STATUS.UNPROCESSED:
      icon = <EditIcon sx={{ ...size, color: blue[500] }} />;
      break;
    default:
      icon = <HelpOutlineIcon sx={{ ...margins, ...size, color: orange[500] }} />;
  }

  return <Tooltip title={tooltipTitle}>{icon}</Tooltip>;
}

export default ScanStatusIcon;
