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
      tabIndex={0}
      className={`relative w-full cursor-pointer rounded-lg border border-border bg-input py-2.5 pr-10 pl-4 text-left text-foreground shadow-sm transition-colors hover:border-border-hover focus-within:ring-2 focus-within:ring-ring ${disabled ? 'pointer-events-none opacity-50' : ''}`}
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
        className='w-full cursor-pointer border-none bg-transparent p-0 text-foreground outline-none focus:ring-0'
        tabIndex={-1}
        disabled={disabled}
        {...rest}
      />
      <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2'>
        <Calendar size={16} className='text-foreground-muted' />
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
