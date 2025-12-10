import type { DateRangePickerProps } from '@mui/x-date-pickers-pro/DateRangePicker';
import { DateRangePicker as MuiDateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import type { SingleInputDateRangeFieldProps } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import type { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';

import { DATE_FORMATS } from '@/constants';

export type DateRangePickerValue = [a: DateTime | null, b: DateTime | null];

type FieldComponent = (<TDate extends DateTime>(
  props: React.RefAttributes<HTMLInputElement> & SingleInputDateRangeFieldProps<TDate>,
) => React.JSX.Element) & { fieldType?: string };

const WrappedSingleInputDateRangeField = React.forwardRef(
  (props: SingleInputDateRangeFieldProps<DateTime>, ref: React.Ref<HTMLInputElement>) => {
    return (
      <SingleInputDateRangeField
        {...props}
        clearable
        inputProps={{ readOnly: true }}
        ref={ref}
      />
    );
  },
) as FieldComponent;

WrappedSingleInputDateRangeField.fieldType = 'single-input';

function DateRangePicker({
  onChange,
  sx,
  value,
  ...restProps
}: DateRangePickerProps<DateTime>) {
  const t = useTranslations();
  return (
    <MuiDateRangePicker
      format={DATE_FORMATS.DATE}
      onChange={onChange}
      slotProps={{
        textField: {
          InputProps: {
            placeholder: t('Shared.dateRangePlaceholder'),
            startAdornment: (
              <Image
                alt="calendar icon"
                height={14}
                src="/icons/calendar.svg"
                width={14}
              />
            ),
          },
        },
      }}
      slots={{ field: WrappedSingleInputDateRangeField }}
      sx={{
        '& .MuiInputBase-root': {
          '& .MuiInputBase-input': {
            '::placeholder': {
              wordSpacing: '30px',
            },
            fontSize: '12px',
            padding: '4px 10px 4px 10px',
          },
          borderRadius: '1px',
          height: '36px',
          width: '260px',
        },
        ...sx,
      }}
      value={value}
      {...restProps}
    />
  );
}

export default DateRangePicker;
