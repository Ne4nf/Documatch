'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import React, { useState } from 'react';
import type { DropEvent, DropzoneProps, FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

import ValidateField from '@/components/ValidateField';
import TextError from '@/components/ValidateField/TextError';
import { TEST_IDS } from '@/constants';

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker',
  import.meta.url,
).toString();

const MAX_FILE_SIZE = 100;
export interface DropzoneCustomProps extends Omit<DropzoneProps, 'children'> {
  bodyContent?: string[];
  children?: React.ReactNode;
  error?: boolean;
  footerContent?: React.ReactNode;
  headerContent?: string;
  helperText?: string;
  isMultiple?: boolean;
  isScrollToErrorEnabled?: boolean;
  onDelete?: (files: File[]) => void;
  onDrop: (files: File[]) => void;
  style?: React.CSSProperties;
  validateLayout?: ValidateLayout;
}
export type ValidateLayout = 'border' | 'inside';

export default function Dropzone({
  bodyContent = [],
  children,
  error = false,
  footerContent,
  headerContent,
  helperText = '',
  isMultiple = false,
  isScrollToErrorEnabled = true,
  onDelete,
  onDrop,
  style,
  validateLayout = 'border',
}: DropzoneCustomProps) {
  const t = useTranslations('Dropzone');
  const [files, setFiles] = useState<File[]>([]);

  const styleFontRegular = {
    fontSize: '14px',
    fontWeight: 400,
  };

  const styleFlexCenter = {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const styleFlexStart = {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  };

  const payloadLayout = {
    border: {
      bodyContent: bodyContent.length
        ? bodyContent
        : [t('maxPagesAtOneTime'), t('maxFileSize')],
      border: 'unset',
      footerContent,
    },
    inside: {
      bodyContent: bodyContent.length
        ? bodyContent
        : [t('maxPagesAtOneTime'), t('maxFileSize')],
      border: 'unset',
      footerContent: footerContent || (
        <TextError sx={{ alignItems: 'center', display: 'flex', marginBottom: '8px' }}>
          {helperText}
        </TextError>
      ),
    },
  };

  const getPdfPageCount = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = async () => {
        try {
          const pdf = await getDocument(new Uint8Array(reader.result as ArrayBuffer))
            .promise;
          resolve(pdf.numPages);
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(e);
        }
      };

      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      reader.onerror = e => reject(e);
    });
  };

  const onDropCallback: (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  ) => void = async acceptedFiles => {
    if (isMultiple === false) {
      if (acceptedFiles[0]) {
        const fileSize = acceptedFiles[0].size / 1024 ** 2;
        if (fileSize > MAX_FILE_SIZE) {
          enqueueSnackbar({ message: t('fileSizeIsTooLarge'), variant: 'error' });
          return;
        }

        const pageCount: number = await getPdfPageCount(acceptedFiles[0]);
        if (pageCount > 100) {
          enqueueSnackbar({ message: t('filePagesCountLimit'), variant: 'error' });
          return;
        }
      }

      setFiles(acceptedFiles);
      if (onDrop) {
        onDrop(acceptedFiles);
      }
      return;
    }
    setFiles(prev => [...prev, ...acceptedFiles]);
    if (onDrop) {
      onDrop([...files, ...acceptedFiles]);
    }
  };

  const { getInputProps, getRootProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: isMultiple,
    onDrop: onDropCallback,
  });

  const handleDeleteFile = (index: number) => {
    const updatedFiles = [...files.slice(0, index), ...files.slice(index + 1)];
    setFiles(updatedFiles);
    if (onDelete) {
      onDelete(updatedFiles);
    }
  };

  return (
    <ValidateField
      error={error}
      helperText={validateLayout === 'border' ? helperText : ''}
      isScrollToErrorEnabled={isScrollToErrorEnabled}
      style={style}
      sx={{
        ...styleFlexStart,
        marginBottom: '20px',
        textAlign: 'left',
      }}
    >
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />
      <Typography
        sx={{
          fontSize: '22px',
          fontWeight: 500,
          lineHeight: '29px',
          marginBottom: '16px',
        }}
      >
        {headerContent || t('uploadNewDocument')}
      </Typography>
      <Box
        sx={{
          ...styleFlexStart,
          marginBottom: '27px',
          textAlign: 'left',
        }}
      >
        {payloadLayout[validateLayout].bodyContent.map((item, index) => {
          const itemKey = `${item}-${index}`;
          return (
            <Typography
              key={itemKey}
              sx={{
                ...styleFontRegular,
              }}
            >
              {item}
            </Typography>
          );
        })}
      </Box>
      <Box
        sx={{
          ...styleFlexCenter,
          background: '#EBEBEB',
          cursor: 'pointer',
          marginBottom: '19px',
          padding: '16px',
          width: '100%',
        }}
        {...getRootProps()}
        data-testid={TEST_IDS.DROPZONE.DROP_BOX}
      >
        <input {...getInputProps()} data-testid={TEST_IDS.DROPZONE.DROP_INPUT} />
        <Image
          alt="download"
          height={19}
          priority
          src="/download.png"
          style={{ marginBottom: 8 }}
          width={22}
        />
        <Typography
          sx={{
            ...styleFontRegular,
          }}
        >
          {t('uploadAreaNotice')}
        </Typography>
        <Typography
          sx={{
            ...styleFontRegular,
          }}
        >
          {t('acceptableFileTypes')}
        </Typography>
      </Box>

      {payloadLayout[validateLayout].footerContent}
      {files.length > 0 && (
        <>
          <Typography
            sx={{
              ...styleFontRegular,
              marginBottom: '8px',
              mt: '1px',
            }}
          >
            {t('filesToBeUploaded')}
          </Typography>
          <Box sx={{ gap: '8px', ...styleFlexStart }}>
            {files.map((item: File, index: number) => {
              const itemKey = `${item.name}-${index}`;
              return (
                <Box
                  data-testid={TEST_IDS.DROPZONE.DELETE_ITEM}
                  key={itemKey}
                  onClick={() => handleDeleteFile(index)}
                  sx={{
                    alignItems: 'flex-end',
                    cursor: 'pointer',
                    display: 'flex',
                    height: '24px',
                    justifyItems: 'flex-end',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#2579E7',
                      fontSize: '14px',
                      fontWeight: 700,
                      marginBottom: '1px',
                      mr: '8px',
                    }}
                  >
                    x
                  </Typography>
                  <Typography
                    sx={{
                      color: '#2579E7',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {item.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </>
      )}
      {children}
    </ValidateField>
  );
}
