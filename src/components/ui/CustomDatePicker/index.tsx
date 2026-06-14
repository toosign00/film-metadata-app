'use client';

import { Calendar } from 'lucide-react';
import { forwardRef } from 'react';
import DatePicker, { type DatePickerProps } from 'react-datepicker';

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>((props, forwardedRef) => {
  const { value, onClick, disabled, ...rest } = props;
  return (
    <div
      role='button'
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={`relative min-h-11 w-full cursor-pointer rounded-[10px] border border-border bg-input px-3 pr-10 text-left text-foreground transition-colors hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-ring-offset ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <input
        ref={forwardedRef}
        type='text'
        readOnly
        value={value}
        className='min-h-11 w-full cursor-pointer border-none bg-transparent p-0 text-sm text-foreground outline-none focus:ring-0'
        tabIndex={-1}
        disabled={disabled}
        {...rest}
      />
      <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2'>
        <Calendar aria-hidden='true' size={16} className='text-foreground-muted' />
      </span>
    </div>
  );
});

CustomInput.displayName = 'CustomInput';

export const CustomDatePicker = (props: DatePickerProps) => {
  return (
    <DatePicker
      {...props}
      customInput={<CustomInput />}
      popperClassName='react-datepicker-dark'
      showPopperArrow={false}
    />
  );
};
