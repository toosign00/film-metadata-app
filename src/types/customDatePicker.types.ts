import type { KeyboardEvent, MouseEvent } from 'react';

export interface CustomInputProps {
  value?: string;
  onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  showTimeSelectOnly?: boolean;
}

export interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeFormat?: string;
  dateFormat?: string;
  placeholderText?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  [key: string]: unknown;
}
