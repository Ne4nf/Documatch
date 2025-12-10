import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const CompactButton = styled(Button)(({ theme }) => ({
  borderRadius: '2px',
  color: theme.palette.common.white,
  height: '26px',
}));

export default CompactButton;
export { CompactButton };
