'use client';

import Box from '@mui/material/Box';
import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import type { SxProps } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    'aria-controls': `simple-tabpanel-${index}`,
    id: `simple-tab-${index}`,
  };
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, index, value, ...other } = props;

  return (
    <Box
      aria-labelledby={`simple-tab-${index}`}
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      position="relative"
      role="tabpanel"
      {...other}
    >
      {value === index && <Box sx={{ mt: '12px' }}>{children}</Box>}
    </Box>
  );
}

const WrapperContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '100%',
}));

interface TabData {
  content: React.ReactNode;
  icon?: React.ReactNode;
  label: React.ReactNode;
  value?: number | string;
}

interface TabsProps {
  button?: ButtonProps;
  onChange?: (index: number | string) => void;
  sx?: SxProps;
  tabData: TabData[];
}

function TabsCustom({ button, onChange, sx, tabData }: TabsProps) {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    onChange?.(tabData[newValue]?.value || newValue);
  };

  const keyExtractor = (index: number) => {
    return `simple-tabpanel-${index}`;
  };
  return (
    <WrapperContainer sx={sx}>
      <Box alignItems="flex-end" display="flex" justifyContent="space-between">
        <Tabs
          aria-label="TabsCustom"
          indicatorColor="primary"
          onChange={handleChange}
          textColor="primary"
          value={value}
        >
          {tabData.map((tab, index) => (
            <Tab
              key={keyExtractor(index)}
              label={
                <Box alignItems="center" display="flex" gap="8px">
                  {tab.icon}
                  {tab.label && (
                    <Typography sx={{ textTransform: 'capitalize' }} variant="body2">
                      {tab.label}
                    </Typography>
                  )}
                </Box>
              }
              sx={{ bgcolor: value === index ? '#EFFAFF' : 'transparent' }}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
        {button && (
          <Button
            color="primary"
            sx={{ height: '40px', textTransform: 'capitalize' }}
            variant="contained"
            {...button}
          />
        )}
      </Box>
      {tabData.map((tab, index) => (
        <CustomTabPanel index={index} key={keyExtractor(index)} value={value}>
          {tab.content}
        </CustomTabPanel>
      ))}
    </WrapperContainer>
  );
}

export default TabsCustom;
export { TabsCustom };
