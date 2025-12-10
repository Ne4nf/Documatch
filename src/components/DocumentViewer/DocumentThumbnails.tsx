import { Box, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import theme from '@/theme';

import type { GroupedThumbnail } from './DocumentViewer';

interface DocumentThumbnailsProps {
  currentGroupId: string;
  handleChangeGroupId: (groupId: string) => void;
  thumbs: GroupedThumbnail[];
}

export default function DocumentThumbnails({
  currentGroupId,
  handleChangeGroupId,
  thumbs,
}: DocumentThumbnailsProps) {
  const t = useTranslations('Document');

  thumbs.sort((a, b) => (a.pages[0] ?? 0) - (b.pages[0] ?? 0));

  return (
    <Stack
      alignItems="center"
      gap={4}
      paddingTop={2}
      sx={{
        maxHeight: 'calc(100vh - 50px)',
        overflowY: 'auto',
      }}
      width="100%"
    >
      <Typography align="center">{t('documentThumbnailPaneHeading')}</Typography>
      {thumbs.map(thumb => (
        <div
          key={thumb.groupId}
          onClick={() => {
            if (thumb.pages[0] && thumb.groupId) {
              handleChangeGroupId(thumb.groupId);
            }
          }}
          onKeyDown={() => {
            if (thumb.pages[0] && thumb.groupId) {
              handleChangeGroupId(thumb.groupId);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <Stack alignItems="center" gap={2}>
            <Box
              border={
                thumb.groupId === currentGroupId
                  ? `1px solid ${theme.palette.primary.main}`
                  : 'none'
              }
            >
              <img
                alt={
                  thumb.pages.length > 1
                    ? `${thumb.pages[0]} - ${thumb.pages[thumb.pages.length - 1]}`
                    : `${thumb.pages[0]}`
                }
                height={800 * 0.2}
                src={thumb.thumbnailUrl}
                style={{ display: 'block' }}
              />
            </Box>
            <Typography>
              {thumb.pages.length > 1
                ? `${thumb.pages[0]} - ${thumb.pages[thumb.pages.length - 1]}`
                : `${thumb.pages[0]}`}
            </Typography>
          </Stack>
        </div>
      ))}
    </Stack>
  );
}
