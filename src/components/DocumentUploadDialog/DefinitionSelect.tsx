import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { useGlobalDataStore } from '@/providers/global-data-store-provider';

interface DefinitionSelectProps {
  onDefinitionChange: (definitionId: string) => void;
}

function DefinitionSelect(props: DefinitionSelectProps) {
  const t = useTranslations('DocumentUploadDialog');
  const { definitions } = useGlobalDataStore(state => state);
  const [definitionId, setDefinitionId] = React.useState<string>('');

  const handleChange = (event: SelectChangeEvent) => {
    const newDefinitionId = event.target.value;
    setDefinitionId(newDefinitionId);
    props.onDefinitionChange(newDefinitionId);
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
          value={definitionId}
        >
          {definitions.map(definition => (
            <MenuItem key={definition.id} value={definition.id}>
              {definition.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default DefinitionSelect;
export { DefinitionSelect };
