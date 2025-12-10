import {
  ArrowDownwardSharp,
  ArrowUpwardSharp,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

interface TableSortLabelProps {
  active: boolean;
  children: ReactNode;
  direction?: 'asc' | 'desc';
  isDocumentType?: boolean;
  onClick: () => void;
}

function TableSortLabel({
  active,
  children,
  direction,
  isDocumentType,
  onClick,
}: TableSortLabelProps) {
  const isAscActive = active && direction === 'asc';
  const isDescActive = active && direction === 'desc';
  const iconStyle = {
    fontSize: '18px',
    position: 'relative',
  };
  const arrowUpStyle = {
    ...iconStyle,
    color: isAscActive ? 'common.black' : 'common.white',
  };
  const arrowDownStyle = {
    ...iconStyle,
    color: isDescActive ? 'common.black' : 'common.white',
  };

  const arrowUpStyleCustom = {
    ...iconStyle,
    color: isAscActive ? 'common.black' : '#757575',
    top: '3px',
  };
  const arrowDownStyleCustom = {
    ...iconStyle,
    bottom: '3px',
    color: isDescActive ? 'common.black' : '#757575',
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {children}
      <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: '4px' }}>
        {isDocumentType ? (
          <>
            <KeyboardArrowUp sx={{ ...arrowUpStyleCustom }} />
            <KeyboardArrowDown sx={{ ...arrowDownStyleCustom }} />
          </>
        ) : (
          <>
            <ArrowUpwardSharp sx={{ ...arrowUpStyle }} />
            <ArrowDownwardSharp sx={{ ...arrowDownStyle }} />
          </>
        )}
      </Box>
    </Box>
  );
}

export default TableSortLabel;
