import type { IconButtonProps } from '@mui/material/IconButton';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

type ToolbarButtonWithTooltipProps = IconButtonProps & {
  disabled?: boolean;
  text: string;
};

const ToolbarButton = styled(IconButton)(() => ({
  borderRadius: 0,
}));

function ToolbarButtonWithTooltip({
  children,
  disabled = false,
  text,
  ...props
}: ToolbarButtonWithTooltipProps) {
  if (disabled) {
    return (
      <ToolbarButton {...props} disabled>
        {children}
      </ToolbarButton>
    );
  }
  return (
    <Tooltip title={text}>
      <ToolbarButton {...props}>{children}</ToolbarButton>
    </Tooltip>
  );
}

export { ToolbarButton, ToolbarButtonWithTooltip };
