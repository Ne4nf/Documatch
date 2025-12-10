import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { useGlobalDataStore } from '@/providers/global-data-store-provider';

interface PromptSelectProps {
  onPromptChange: (definitionId: string) => void;
}

function PromptSelect(props: PromptSelectProps) {
  const t = useTranslations('DocumentUploadDialog');
  const { prompts } = useGlobalDataStore(state => state);
  const [promptId, setPromptId] = React.useState<string>('');

  const handleChange = (event: SelectChangeEvent) => {
    const newPromptId = event.target.value;
    setPromptId(newPromptId);
    props.onPromptChange(newPromptId);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="document-type-label">{t('documentType')}</InputLabel>
        <Select
          id="document-type-select"
          label={t('documentType')}
          labelId="document-type-label"
          onChange={handleChange}
          value={promptId}
        >
          {prompts.map(prompt => (
            <MenuItem key={prompt.id} value={prompt.id}>
              {prompt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default PromptSelect;
export { PromptSelect };
