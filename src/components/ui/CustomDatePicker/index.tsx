'use client';

import { Calendar } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import DatePicker, { type DatePickerProps } from 'react-datepicker';

type CustomInputProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> & {
  value?: string;
  placeholder?: string;
};

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>((props, forwardedRef) => {
  const { value, placeholder, className = '', disabled, ...rest } = props;
  return (
    <button
      {...rest}
      ref={forwardedRef}
      type='button'
      disabled={disabled}
      className={`relative min-h-11 w-full cursor-pointer rounded-[10px] border border-border bg-input px-3 pr-10 text-left text-foreground transition-colors hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-ring-offset disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      <span className={`text-sm ${value ? '' : 'text-foreground-muted/70'}`}>
        {value || placeholder}
      </span>
      <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2'>
        <Calendar aria-hidden='true' size={16} className='text-foreground-muted' />
      </span>
    </button>
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
