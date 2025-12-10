import { CheckCircle, DeleteOutline } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { RawDocument } from '@netsmile/page-edit-component';
import { useTranslations } from 'next-intl';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useCallback, useState } from 'react';

import { useDocumentDataStore } from '@/providers/document-data-store-provider';
import { useGlobalDataStore } from '@/providers/global-data-store-provider';

import { ToolbarButtonWithTooltip } from '../Buttons';
import TextField from '../TextField';
import { MAX_PAGES_PER_GROUP } from './DocumentRescanModal';
import { customDocumentGrouping } from './handler';

const predefinedColors = [
  'rgb(255, 212, 0)',
  'rgb(164, 204, 74)',
  'rgb(0, 191, 255)',
  'rgb(51, 87, 255)',
  'rgb(143, 132, 240)',
  'rgb(217, 145, 248)',
  'rgb(69, 220, 92)',
  'rgb(40, 221, 166)',
  'rgb(238, 148, 64)',
  'rgb(238, 76, 64)',
];

export interface Group {
  documentType: string;
  error: null | string;
  id: number;
  pageRange: { from: number; to: number };
  useOcr: boolean;
}

interface DocumentCustomGroupingProps {
  closeModal: () => void;
  data: RawDocument;
  isModalOpen: boolean;
  isScanScreen?: boolean;
  openRescanModal: () => void;
  refreshDocument?: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
}

export default function DocumentCustomGroupingModal({
  closeModal,
  data,
  isModalOpen,
  isScanScreen = false,
  openRescanModal,
  refreshDocument,
  setLoading,
}: DocumentCustomGroupingProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isError, setIsError] = useState(false);
  const tDocumentRescan = useTranslations('DocumentRescan');
  const tDocument = useTranslations('Document');
  const { prompts } = useGlobalDataStore(state => state);
  const promptNames = prompts.map(prompt => prompt.name);
  const updateDocument = useDocumentDataStore(state => state.updateDocument);

  const renderOptions = useCallback(() => {
    const validatePageRange = (
      from: number,
      groupId: number,
      to: number,
      totalPages: number,
    ) => {
      let error: null | string =
        from > to || from < 1 || to > totalPages
          ? tDocumentRescan('invalidPageRange')
          : null;
      groups.forEach(group => {
        if (group.id !== groupId) {
          if (!(from > group.pageRange.to || to < group.pageRange.from)) {
            error = tDocumentRescan('pageRangesCannotOverlap');
          }
        }
      });
      setIsError(!!error);
      setGroups(prev =>
        prev.map(group =>
          group.id === groupId
            ? { ...group, error }
            : { ...group, error: error === null ? null : group.error },
        ),
      );
    };

    const removeGroup = (groupIndex: number) => {
      setGroups(prev => [...prev].filter((_, index) => index !== groupIndex));
    };

    const handleGroupChange = (
      id: number,
      field: string,
      value: boolean | number | object | string,
    ) => {
      setGroups((prev: Group[]) => {
        const updatedGroups = prev.map(group => {
          if (group.id === id) {
            if (field === 'pages' && typeof value === 'object') {
              const newPages = { ...group.pageRange, ...value };
              validatePageRange(
                Number(newPages.from),
                group.id,
                Number(newPages.to),
                data.pages.length,
              );
              return { ...group, pageRange: newPages };
            }
            return { ...group, [field]: value };
          }
          return group;
        });
        return updatedGroups;
      });
    };

    return groups.map((group, index) => (
      <Box key={group.id} mb={2}>
        <Stack
          gap={1}
          sx={{
            border: `2px solid ${predefinedColors[index]}`,
            borderRadius: '4px',
            width: '100%',
          }}
        >
          <Box
            sx={{
              backgroundColor: `${lightenColor(predefinedColors[index])}`,
              padding: '4px',
            }}
          >
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              sx={{ marginBottom: '12px' }}
            >
              <Stack alignItems="center" direction="row" gap={1}>
                <CheckCircle sx={{ color: `${predefinedColors[index]}` }} />
                <Typography sx={{ fontWeight: 600 }} variant="h6">
                  {tDocumentRescan('group')} {index + 1}
                </Typography>
              </Stack>
              <IconButton onClick={() => removeGroup(index)}>
                <DeleteOutline />
              </IconButton>
            </Stack>
          </Box>
          <Stack gap={2} sx={{ padding: '8px' }}>
            <Stack alignItems="center" direction="row" gap={2}>
              <Typography>{tDocumentRescan('documentType')}</Typography>
              <Select
                displayEmpty
                onChange={e =>
                  handleGroupChange(group.id, 'documentType', e.target.value)
                }
                sx={{ flex: 1 }}
                value={group.documentType}
              >
                {promptNames.map(promptName => (
                  <MenuItem value={promptName}>{promptName}</MenuItem>
                ))}
              </Select>
            </Stack>
            <Stack
              alignItems="center"
              direction="row"
              gap={2}
              justifyContent="space-between"
            >
              <Typography>{tDocumentRescan('pages')}</Typography>
              <Stack direction="row" gap={2}>
                <TextField
                  onChange={e =>
                    handleGroupChange(group.id, 'pages', { from: Number(e.target.value) })
                  }
                  sx={{ width: '80px' }}
                  type="number"
                  value={group.pageRange.from}
                />
                <Typography>{tDocumentRescan('to')}</Typography>
                <TextField
                  onChange={e =>
                    handleGroupChange(group.id, 'pages', { to: Number(e.target.value) })
                  }
                  sx={{ width: '80px' }}
                  type="number"
                  value={group.pageRange.to}
                />
              </Stack>
            </Stack>
            <FormHelperText error={isError}>{group.error}</FormHelperText>
            <Stack alignItems="center" direction="row" gap={2}>
              <Checkbox
                checked={group.useOcr}
                onChange={e => handleGroupChange(group.id, 'useOcr', e.target.checked)}
              />
              <Typography>{tDocumentRescan('addOcrResult')}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    ));
  }, [groups, data?.pages?.length, isError, promptNames, tDocumentRescan]);

  const renderButton = useCallback(() => {
    const addGroup = () => {
      const nextGroupId = groups.length + 1;
      const newStartingPage = Math.min(
        (groups[groups.length - 1]?.pageRange.to ?? 0) + 1,
        data.pages.length,
      );
      const newGroup = {
        documentType: '',
        error:
          newStartingPage === groups[groups.length - 1]?.pageRange.to
            ? tDocumentRescan('pageRangesCannotOverlap')
            : null,
        id: nextGroupId,
        pageRange: {
          from: newStartingPage,
          to:
            newStartingPage + MAX_PAGES_PER_GROUP - 1 > data.pages.length
              ? data.pages.length
              : newStartingPage + MAX_PAGES_PER_GROUP - 1,
        },
        useOcr: false,
      };
      if (newGroup.error || newGroup.documentType.length === 0) {
        setIsError(true);
      }
      setGroups([...groups, newGroup]);
    };
    return (
      <Button color="primary" onClick={addGroup} variant="contained">
        {tDocumentRescan('addGroup')}
      </Button>
    );
  }, [groups, tDocumentRescan]);

  const renderPages = useCallback(() => {
    return data?.pages?.map((page, pageIndex) => {
      const keyExtractor = `thumbnail-${pageIndex}`;
      const { pageNumber, thumbnailUrl } = page;
      const groupForPage = groups.find(
        group => pageNumber >= group.pageRange.from && pageNumber <= group.pageRange.to,
      );

      return (
        <Box
          key={keyExtractor}
          style={{ minHeight: '283px', width: '163px' }}
          sx={{
            background: '#E9E9F1',
            border: '1px solid',
            display: 'flex',
            flexDirection: 'column',
            height: 'auto',
            padding: '10px 10px 4px 10px',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-evenly',
              position: 'relative',
            }}
          >
            <img alt="thumbnail" src={thumbnailUrl || ''} width={140} />
            {groupForPage && (
              <Box
                sx={{
                  alignItems: 'center',
                  backgroundColor: `${predefinedColors[groups.indexOf(groupForPage)]}`,
                  borderRadius: '50%',
                  color: 'white',
                  display: 'flex',
                  height: '24px',
                  justifyContent: 'center',
                  left: '8px',
                  position: 'absolute',
                  top: '10px',
                  width: '24px',
                }}
              >
                ✓
              </Box>
            )}
          </Box>
          <Typography
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
            variant="h6"
          >
            {`${page.pageNumber}`}
          </Typography>
        </Box>
      );
    });
  }, [data.pages, groups]);

  const renderFiles = useCallback(() => {
    return (
      <Box
        className="file-preview-row"
        sx={{
          background:
            "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='white' stroke='%23333' stroke-width='2' stroke-dasharray='5%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")",
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '16px',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{renderPages()}</Box>
      </Box>
    );
  }, [renderPages]);

  const goBack = () => {
    closeModal();
    openRescanModal();
  };

  const handleRescan = async () => {
    if (groups.length === 0) {
      enqueueSnackbar({
        message: tDocumentRescan('noGroupError'),
        variant: 'error',
      });
      return;
    }

    if (
      groups.find(group => group.error !== null) ||
      (groups.at(-1)?.pageRange?.to ?? 0) < data.pages.length
    ) {
      enqueueSnackbar({
        message: tDocumentRescan('invalidPageRange'),
        variant: 'error',
      });
      return;
    }

    if (groups.find(group => group.documentType.length === 0)) {
      enqueueSnackbar({
        message: tDocumentRescan('noDocumentTypeError'),
        variant: 'error',
      });
      return;
    }

    const processRescan = async () => {
      try {
        await customDocumentGrouping(data, groups, prompts);
        if (refreshDocument) {
          await refreshDocument();
        } else {
          await updateDocument(data.id);
        }
      } catch (e) {
        console.error('Error processing rescan', e);
      }
    };
    closeModal();
    setLoading(true);
    await processRescan();
    setLoading(false);
  };

  return (
    <Dialog fullScreen onClose={closeModal} open={isModalOpen}>
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />
      <Stack bgcolor="#FFFFFF" sx={{ inset: 0, position: 'absolute' }}>
        <Stack alignItems="center" direction="row" p={2}>
          <ToolbarButtonWithTooltip
            aria-label={tDocument('documentBack')}
            onClick={goBack}
            text={tDocument('documentBack')}
          >
            <ArrowBackIcon />
          </ToolbarButtonWithTooltip>
          <Typography fontWeight={300}>
            {isScanScreen
              ? tDocumentRescan('scanWholeDocument')
              : tDocumentRescan('rescanWholeDocument')}
            <span style={{ fontWeight: 600 }}>
              {' '}
              - {tDocumentRescan('customDocumentGrouping')}
            </span>
          </Typography>
        </Stack>
        <Stack direction="row" flex={1}>
          <Box
            sx={{
              backgroundColor: '#F1F1F1',
              display: 'flex',
              flex: 3,
              flexDirection: 'column',
              gap: '17px',
              overflow: 'auto',
              padding: '18px',
            }}
          >
            <Typography variant="h5">{tDocumentRescan('pdfGrouping')}</Typography>
            {renderFiles()}
          </Box>
          <Stack flex={1} p={2} sx={{ boxShadow: '-4px 0px 10px rgba(0, 0, 0, 0.2)' }}>
            <Typography sx={{ fontSize: '20px', fontWeight: 600, mb: '28px' }}>
              {tDocumentRescan('groupSetting')}
            </Typography>
            <Box sx={{ flexGrow: 1, height: 640 }}>
              <Box gap={2} sx={{ height: '100%', overflowY: 'auto' }}>
                <div>
                  {renderOptions()}
                  {renderButton()}
                </div>
              </Box>
            </Box>
          </Stack>
        </Stack>
        <Stack
          bgcolor="#F1F1F1"
          direction="row"
          gap="8px"
          justifyContent="flex-end"
          p={2}
          sx={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)' }}
          zIndex={1000}
        >
          <Button color="secondary" onClick={() => setGroups([])} variant="text">
            {tDocumentRescan('clearAll')}
          </Button>
          <Button
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={() => handleRescan()}
            variant="contained"
          >
            {isScanScreen ? tDocumentRescan('scan') : tDocumentRescan('rescan')}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}

function lightenColor(inputRGB: string | undefined, percent = 80) {
  // Extract the RGB values from the input string
  const match = inputRGB?.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) {
    return inputRGB;
  }

  let [, r, g, b] = match.map(Number); // Convert the extracted values to numbers

  if (r === undefined || g === undefined || b === undefined) {
    return inputRGB;
  }
  // Adjust each color channel by the given percentage
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  return `rgb(${r}, ${g}, ${b})`;
}
